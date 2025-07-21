import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  columnId: TaskStatus;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

const columnConfig = {
  todo: { 
    bg: 'bg-kanban-todo border-blue-200', 
    header: 'bg-blue-100 text-blue-800 border-blue-200',
    count: 'bg-blue-500 text-white'
  },
  progress: { 
    bg: 'bg-kanban-progress border-yellow-200', 
    header: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    count: 'bg-yellow-500 text-white'
  },
  done: { 
    bg: 'bg-kanban-done border-green-200', 
    header: 'bg-green-100 text-green-800 border-green-200',
    count: 'bg-green-500 text-white'
  }
};

export function TaskColumn({ columnId, title, tasks, onEdit, onDelete, onAddTask }: TaskColumnProps) {
  const config = columnConfig[columnId];

  return (
    <Card className={cn("p-4 min-h-[600px] w-80", config.bg)}>
      <div className={cn("flex items-center justify-between p-3 rounded-lg mb-4", config.header)}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{title}</h2>
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.count)}>
            {tasks.length}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAddTask(columnId)}
          className="h-8 w-8 p-0 hover:bg-white/50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "min-h-[500px] transition-colors duration-200 rounded-lg p-2",
              snapshot.isDraggingOver && "bg-white/50 ring-2 ring-primary/20"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Nenhuma tarefa</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAddTask(columnId)}
                  className="text-xs"
                >
                  Adicionar primeira tarefa
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </Card>
  );
}