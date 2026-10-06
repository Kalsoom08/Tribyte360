import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import mongoose, { Connection, Model, Schema } from 'mongoose';

export * from './schemas';

@Injectable()
export class ConnectionManagerService implements OnApplicationShutdown {
  private tenantConnections: Map<string, Connection> = new Map();
  private superConnection: Connection | null = null;

  async getSuperDatabaseConnection(uri?: string): Promise<Connection> {
    if (!this.superConnection) {
      const dbUri = uri || process.env.SUPER_DB_URI || 'mongodb://127.0.0.1:27017/super_db';
      this.superConnection = await mongoose.createConnection(dbUri).asPromise();
      console.log('Connected to Super Database:', dbUri);
    }
    return this.superConnection;
  }

  async getTenantDatabaseConnection(tenantSlug: string, baseMongoUri?: string): Promise<Connection> {
    if (this.tenantConnections.has(tenantSlug)) {
      return this.tenantConnections.get(tenantSlug)!;
    }

    const baseUrl = baseMongoUri || process.env.BASE_MONGO_URI || 'mongodb://127.0.0.1:27017';
    const tenantDbName = `tenant_${tenantSlug.toLowerCase()}`;
    const fullUri = `${baseUrl}/${tenantDbName}`;

    const connection = await mongoose.createConnection(fullUri).asPromise();
    this.tenantConnections.set(tenantSlug, connection);
    console.log(`Connected to Tenant Database: ${tenantDbName}`);

    return connection;
  }

  async getTenantModel<T>(
    tenantSlug: string,
    modelName: string,
    schema: Schema<T>,
  ): Promise<Model<T>> {
    const connection = await this.getTenantDatabaseConnection(tenantSlug);
    return connection.models[modelName]
      ? (connection.models[modelName] as Model<T>)
      : connection.model<T>(modelName, schema);
  }

  async onApplicationShutdown() {
    if (this.superConnection) {
      await this.superConnection.close();
    }
    for (const [slug, conn] of this.tenantConnections) {
      await conn.close();
      console.log(`Closed connection for tenant: ${slug}`);
    }
  }
}
