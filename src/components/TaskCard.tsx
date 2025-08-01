import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Calendar, User, Building, AlertTriangle, Clock } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types/task';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityConfig = {
  low: { color: 'bg-success text-success-foreground', icon: '●' },
  medium: { color: 'bg-warning text-warning-foreground', icon: '●' },
  high: { color: 'bg-destructive text-destructive-foreground', icon: '●' }
};

const getDueDateStatus = (dueDate?: Date) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'overdue', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle, text: 'Vencida' };
  } else if (diffDays <= 2) {
    return { status: 'warning', color: 'bg-warning text-warning-foreground', icon: Clock, text: `${diffDays}d restante${diffDays !== 1 ? 's' : ''}` };
  } else if (diffDays <= 7) {
    return { status: 'upcoming', color: 'bg-muted text-muted-foreground', icon: Calendar, text: `${diffDays}d restante${diffDays !== 1 ? 's' : ''}` };
  }
  
  return null;
};

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "p-4 mb-3 cursor-grab transition-all duration-200 group",
            "hover:shadow-lg hover:scale-[1.02] hover:rotate-1",
            "border border-border bg-gradient-to-br from-card to-muted/30",
            snapshot.isDragging && "rotate-3 scale-105 shadow-xl ring-2 ring-primary/20"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={priorityConfig[task.priority].color}>
                {priorityConfig[task.priority].icon} {task.priority}
              </Badge>
              {dueDateStatus && (
                <Badge className={dueDateStatus.color}>
                  <dueDateStatus.icon className="h-3 w-3 mr-1" />
                  {dueDateStatus.text}
                </Badge>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    isHovered && "opacity-100"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-semibold text-foreground mb-2 leading-tight">
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {(task.assignee || task.area) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {task.assignee && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
                  <User className="h-3 w-3" />
                  {task.assignee}
                </div>
              )}
              {task.area && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
                  <Building className="h-3 w-3" />
                  {task.area}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(task.createdAt).toLocaleDateString('pt-BR')}
            </div>
            {task.dueDate && (
              <div className="flex items-center">
                <span className="text-xs">Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </Draggable>
  );
}