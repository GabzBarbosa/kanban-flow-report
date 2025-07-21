import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskColumn } from '@/types/task';
import { TaskColumn as TaskColumnComponent } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useToast } from '@/hooks/use-toast';

const initialColumns: TaskColumn[] = [
  {
    id: 'todo',
    title: 'A Fazer',
    tasks: [],
  },
  {
    id: 'progress',
    title: 'Em Progresso',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Concluído',
    tasks: [],
  },
];

// Tarefas de exemplo para demonstração
const sampleTasks: Task[] = [
  {
    id: uuidv4(),
    title: 'Configurar projeto React',
    description: 'Instalar dependências e configurar estrutura inicial do projeto Kanban',
    status: 'done',
    priority: 'high',
    evolutions: [
      { id: uuidv4(), content: 'Projeto criado e estrutura inicial configurada', createdAt: new Date('2024-01-15') }
    ],
    results: 'Projeto configurado com sucesso, todas as dependências instaladas',
    tests: 'Testes de build e desenvolvimento executados',
    attachments: [],
    research: 'Documentação do React e Vite consultada',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: uuidv4(),
    title: 'Implementar sistema de drag & drop',
    description: 'Adicionar funcionalidade para arrastar tarefas entre as colunas',
    status: 'progress',
    priority: 'medium',
    evolutions: [
      { id: uuidv4(), content: 'Biblioteca @hello-pangea/dnd instalada', createdAt: new Date('2024-01-16') }
    ],
    results: 'Sistema parcialmente implementado',
    tests: 'Testes básicos de drag funcionando',
    attachments: [],
    research: 'Análise de bibliotecas de drag and drop',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: uuidv4(),
    title: 'Criar interface de usuário',
    description: 'Desenvolver componentes visuais e design responsivo',
    status: 'todo',
    priority: 'medium',
    evolutions: [],
    results: '',
    tests: '',
    attachments: [],
    research: '',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: uuidv4(),
    title: 'Adicionar sistema de relatórios',
    description: 'Implementar geração de relatórios semanais e mensais',
    status: 'todo',
    priority: 'low',
    evolutions: [],
    results: '',
    tests: '',
    attachments: [],
    research: '',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState<TaskColumn[]>(initialColumns);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const { toast } = useToast();

  // Carregar tarefas de exemplo na inicialização
  useEffect(() => {
    const columnsWithTasks = initialColumns.map(column => ({
      ...column,
      tasks: sampleTasks.filter(task => task.status === column.id),
    }));
    setColumns(columnsWithTasks);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns.find(col => col.id === source.droppableId);
    const finish = columns.find(col => col.id === destination.droppableId);

    if (!start || !finish) return;

    if (start === finish) {
      const newTasks = Array.from(start.tasks);
      const [reorderedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedTask);

      const newColumn = {
        ...start,
        tasks: newTasks,
      };

      setColumns(columns.map(col => col.id === newColumn.id ? newColumn : col));
      return;
    }

    const startTasks = Array.from(start.tasks);
    const [movedTask] = startTasks.splice(source.index, 1);
    const finishTasks = Array.from(finish.tasks);
    
    const updatedTask = {
      ...movedTask,
      status: destination.droppableId as TaskStatus,
      updatedAt: new Date(),
    };
    
    finishTasks.splice(destination.index, 0, updatedTask);

    const newStart = {
      ...start,
      tasks: startTasks,
    };

    const newFinish = {
      ...finish,
      tasks: finishTasks,
    };

    setColumns(columns.map(col => {
      if (col.id === newStart.id) return newStart;
      if (col.id === newFinish.id) return newFinish;
      return col;
    }));

    toast({
      title: "Tarefa movida!",
      description: `"${updatedTask.title}" foi movida para ${finish.title}`,
    });
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = columns.flatMap(col => col.tasks).find(t => t.id === taskId);
    if (task) {
      setDeletingTask(task);
      setIsDeleteModalOpen(true);
    }
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      // Editar tarefa existente
      const updatedTask = {
        ...editingTask,
        ...taskData,
        updatedAt: new Date(),
      };

      setColumns(columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ).filter(task => task.status === column.id)
      })).map(column => ({
        ...column,
        tasks: taskData.status === column.id 
          ? [...column.tasks.filter(t => t.id !== editingTask.id), updatedTask]
          : column.tasks
      })));

      toast({
        title: "Tarefa atualizada!",
        description: `"${updatedTask.title}" foi atualizada com sucesso.`,
      });
    } else {
      // Criar nova tarefa
      const newTask: Task = {
        id: uuidv4(),
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setColumns(columns.map(column => 
        column.id === taskData.status 
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      ));

      toast({
        title: "Tarefa criada!",
        description: `"${newTask.title}" foi adicionada à coluna ${columns.find(c => c.id === taskData.status)?.title}.`,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingTask) return;

    setColumns(columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== deletingTask.id),
    })));

    toast({
      title: "Tarefa excluída!",
      description: `"${deletingTask.title}" foi removida do board.`,
      variant: "destructive",
    });

    setDeletingTask(undefined);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <TaskColumnComponent
              key={column.id}
              columnId={column.id}
              title={column.title}
              tasks={column.tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        defaultStatus={defaultStatus}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title || ''}
      />
    </div>
  );
}