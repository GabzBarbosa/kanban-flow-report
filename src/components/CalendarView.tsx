import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Circle, 
  User, 
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityConfig = {
  low: { color: 'bg-green-100 text-green-800 border-green-200', icon: Circle },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  high: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
};

const statusConfig = {
  todo: { color: 'bg-gray-100 text-gray-800', icon: Circle, label: 'A Fazer' },
  progress: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Em Progresso' },
  done: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Concluído' }
};

export function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Filtra tarefas que têm data limite
  const tasksWithDueDate = tasks.filter(task => task.dueDate);

  // Função para obter tarefas de uma data específica
  const getTasksForDate = (date: Date) => {
    return tasksWithDueDate.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  // Função para verificar se uma data tem tarefas
  const hasTasksOnDate = (date: Date) => {
    return getTasksForDate(date).length > 0;
  };

  // Obter tarefas da data selecionada
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Função para renderizar modificadores de datas no calendário
  const modifiers = {
    hasTasks: (date: Date) => hasTasksOnDate(date),
    hasOverdue: (date: Date) => {
      const dateTasks = getTasksForDate(date);
      return dateTasks.some(task => {
        const dueDate = new Date(task.dueDate!);
        return dueDate < new Date() && task.status !== 'done';
      });
    },
    hasHigh: (date: Date) => {
      const dateTasks = getTasksForDate(date);
      return dateTasks.some(task => task.priority === 'high');
    }
  };

  const modifiersStyles = {
    hasTasks: { 
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '6px'
    },
    hasOverdue: { 
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '6px'
    },
    hasHigh: { 
      fontWeight: 'bold'
    }
  };

  const getDueDateStatus = (dueDate: Date, status: string) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (status === 'done') return 'completed';
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'today': return 'bg-orange-100 text-orange-800';
      case 'soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visualização do Calendário</h2>
          <p className="text-muted-foreground">
            Visualize suas tarefas organizadas por data limite
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            size="sm"
          >
            Mês
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            size="sm"
          >
            Semana
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
                showOutsideDays={false}
              />
              
              {/* Legenda */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Legenda:</h4>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Com tarefas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span>Tarefas vencidas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de tarefas da data selecionada */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedDateTasks.length === 0
                  ? 'Nenhuma tarefa nesta data'
                  : `${selectedDateTasks.length} tarefa${selectedDateTasks.length > 1 ? 's' : ''}`
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDateTasks.map((task) => {
                const dueDateStatus = getDueDateStatus(new Date(task.dueDate!), task.status);
                const PriorityIcon = priorityConfig[task.priority].icon;
                const StatusIcon = statusConfig[task.status].icon;
                
                return (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm leading-tight">
                        {task.title}
                      </h4>
                      <div className="flex gap-1">
                        <Badge className={cn('text-xs', priorityConfig[task.priority].color)}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge className={cn('text-xs', statusConfig[task.status].color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[task.status].label}
                      </Badge>
                      
                      <Badge className={cn('text-xs', getStatusBadgeColor(dueDateStatus))}>
                        {dueDateStatus === 'completed' && 'Concluída'}
                        {dueDateStatus === 'overdue' && 'Vencida'}
                        {dueDateStatus === 'today' && 'Hoje'}
                        {dueDateStatus === 'soon' && 'Em breve'}
                        {dueDateStatus === 'normal' && 'No prazo'}
                      </Badge>
                    </div>
                    
                    {(task.assignee || task.area) && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee}
                          </div>
                        )}
                        {task.area && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {task.area}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}