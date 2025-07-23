import { useState, useMemo } from 'react';
import { Clock, User, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types/task';
import { format, isToday, isYesterday, isTomorrow, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

type SortOption = 'created' | 'due' | 'updated' | 'priority';

export const TimelineView = ({ tasks, onEditTask }: TimelineViewProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('created');

  const formatDateRelative = (date: Date) => {
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    if (isTomorrow(date)) return 'Amanhã';
    
    const daysDiff = differenceInDays(date, new Date());
    if (daysDiff > 0 && daysDiff <= 7) {
      return `Em ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'}`;
    }
    if (daysDiff < 0 && daysDiff >= -7) {
      return `${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'dia' : 'dias'} atrás`;
    }
    
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Clock className="h-4 w-4 text-warning" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'destructive';
      case 'progress': return 'default';
      case 'done': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <XCircle className="h-4 w-4" />;
      case 'progress': return <Clock className="h-4 w-4" />;
      case 'done': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const sortedTasks = useMemo(() => {
    const sortedArray = [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'due':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });
    return sortedArray;
  }, [tasks, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline de Tarefas</h2>
          <p className="text-sm text-muted-foreground">
            Visualize suas tarefas em ordem cronológica
          </p>
        </div>
        
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Data de Criação</SelectItem>
            <SelectItem value="updated">Última Atualização</SelectItem>
            <SelectItem value="due">Data de Vencimento</SelectItem>
            <SelectItem value="priority">Prioridade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {sortedTasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-4 w-4 h-4 bg-primary rounded-full border-2 border-background z-10"></div>
              
              {/* Task card */}
              <div className="ml-12">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onEditTask(task)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(task.priority)}
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {sortBy === 'created' && formatDateRelative(new Date(task.createdAt))}
                            {sortBy === 'updated' && formatDateRelative(new Date(task.updatedAt))}
                            {sortBy === 'due' && task.dueDate && formatDateRelative(new Date(task.dueDate))}
                            {sortBy === 'priority' && `Prioridade ${task.priority}`}
                          </div>
                          
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignee}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(task.status)} className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          {task.status === 'todo' ? 'À Fazer' : 
                           task.status === 'progress' ? 'Em Progresso' : 'Concluído'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {task.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Criado: {format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                          {task.dueDate && (
                            <span>Vence: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          )}
                        </div>
                        
                        {task.area && (
                          <Badge variant="outline" className="text-xs">
                            {task.area}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          ))}
          
          {sortedTasks.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira tarefa para ver a timeline
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};