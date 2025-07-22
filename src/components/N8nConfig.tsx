import { useState } from 'react';
import { Settings, Send, CheckCircle } from 'lucide-react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface N8nConfigProps {
  tasks: Task[];
}

export function N8nConfig({ tasks }: N8nConfigProps) {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('n8n-webhook-url') || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveWebhookUrl = () => {
    localStorage.setItem('n8n-webhook-url', webhookUrl);
    toast({
      title: "Configuração salva",
      description: "URL do webhook n8n foi salva com sucesso.",
    });
    setIsOpen(false);
  };

  const checkDeadlines = async () => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Configure primeiro a URL do webhook n8n.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const now = new Date();
    const tasksWithDeadlines = tasks.filter(task => task.dueDate);
    
    const overdueTasks = tasksWithDeadlines.filter(task => {
      const dueDate = new Date(task.dueDate!);
      return dueDate < now;
    });

    const upcomingTasks = tasksWithDeadlines.filter(task => {
      const dueDate = new Date(task.dueDate!);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    const alertData = {
      timestamp: new Date().toISOString(),
      source: 'TaskFlow - Kanban',
      overdueTasks: overdueTasks.map(task => ({
        id: task.id,
        title: task.title,
        assignee: task.assignee,
        area: task.area,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority
      })),
      upcomingTasks: upcomingTasks.map(task => ({
        id: task.id,
        title: task.title,
        assignee: task.assignee,
        area: task.area,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        daysRemaining: Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
      summary: {
        totalTasks: tasks.length,
        tasksWithDeadlines: tasksWithDeadlines.length,
        overdue: overdueTasks.length,
        upcoming: upcomingTasks.length
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(alertData),
      });

      toast({
        title: "Verificação enviada",
        description: `Dados enviados para n8n: ${overdueTasks.length} vencidas, ${upcomingTasks.length} próximas do prazo.`,
      });
    } catch (error) {
      console.error("Erro ao enviar para n8n:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar dados para n8n. Verifique a URL do webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tasksWithDeadlines = tasks.filter(task => task.dueDate);
  const now = new Date();
  const overdueTasks = tasksWithDeadlines.filter(task => new Date(task.dueDate!) < now);
  const upcomingTasks = tasksWithDeadlines.filter(task => {
    const dueDate = new Date(task.dueDate!);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Alertas de Prazos - n8n
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{tasksWithDeadlines.length}</div>
            <div className="text-sm text-muted-foreground">Com prazo</div>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <div className="text-sm text-muted-foreground">Vencidas</div>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{upcomingTasks.length}</div>
            <div className="text-sm text-muted-foreground">Próximas</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={checkDeadlines}
            disabled={isLoading}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? "Enviando..." : "Verificar Prazos"}
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar n8n Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/deadlines"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Configure um webhook no n8n para receber alertas de prazos.</p>
                  <p className="mt-2">Os dados enviados incluem:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Tarefas vencidas</li>
                    <li>Tarefas próximas do prazo (7 dias)</li>
                    <li>Informações do responsável e área</li>
                    <li>Resumo geral dos prazos</li>
                  </ul>
                </div>
                <Button onClick={saveWebhookUrl} className="w-full">
                  Salvar Configuração
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}