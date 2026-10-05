import { Button, Card, CardTitle, Badge, LayoutDashboard, CheckCircle2 } from '@repo/ui';
import { getTranslation } from '@repo/i18n';

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AMS — Asset Management System</h1>
          <p className="text-sm text-slate-500">Autonomous application in the Turborepo workspace</p>
        </div>
        <Badge variant="success">Online :3001</Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-4">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <CardTitle>Architecture Status</CardTitle>
          </div>
          <p className="text-sm text-slate-600">
            {getTranslation('welcome', 'en')} — Verified shared UI design system, isolated dependencies, and zero tight coupling.
          </p>
          <Button variant="primary">Access Workspace</Button>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <CardTitle>Tenancy Directives</CardTitle>
          </div>
          <p className="text-sm text-slate-600">
            Subdomain resolution via @repo/tenant and multi-tenant HTTP headers configured.
          </p>
          <Button variant="outline">Inspect Tenancy</Button>
        </Card>
      </div>
    </main>
  );
}
