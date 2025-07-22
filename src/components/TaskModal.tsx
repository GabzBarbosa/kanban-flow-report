import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Task, TaskPriority, TaskStatus, TaskEvolution, TaskAttachment } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, X, FileText, Calendar, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  task?: Task;
  defaultStatus?: TaskStatus;
}

export function TaskModal({ isOpen, onClose, onSave, task, defaultStatus = 'todo' }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [evolutions, setEvolutions] = useState<TaskEvolution[]>([]);
  const [results, setResults] = useState('');
  const [tests, setTests] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [research, setResearch] = useState('');
  const [assignee, setAssignee] = useState('');
  const [area, setArea] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [newEvolution, setNewEvolution] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setEvolutions(task.evolutions || []);
      setResults(task.results || '');
      setTests(task.tests || '');
      setAttachments(task.attachments || []);
      setResearch(task.research || '');
      setAssignee(task.assignee || '');
      setArea(task.area || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setEvolutions([]);
      setResults('');
      setTests('');
      setAttachments([]);
      setResearch('');
      setAssignee('');
      setArea('');
      setDueDate(undefined);
    }
    setNewEvolution('');
  }, [task, defaultStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      evolutions,
      results: results.trim(),
      tests: tests.trim(),
      attachments,
      research: research.trim(),
      assignee: assignee.trim() || undefined,
      area: area.trim() || undefined,
      dueDate,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('medium');
    setEvolutions([]);
    setResults('');
    setTests('');
    setAttachments([]);
    setResearch('');
    setAssignee('');
    setArea('');
    setDueDate(undefined);
    setNewEvolution('');
    onClose();
  };

  const addEvolution = () => {
    if (!newEvolution.trim()) return;
    
    const evolution: TaskEvolution = {
      id: uuidv4(),
      content: newEvolution.trim(),
      createdAt: new Date(),
    };
    
    setEvolutions([...evolutions, evolution]);
    setNewEvolution('');
  };

  const removeEvolution = (id: string) => {
    setEvolutions(evolutions.filter(e => e.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const attachment: TaskAttachment = {
        id: uuidv4(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      };
      setAttachments(prev => [...prev, attachment]);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Título *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da tarefa"
                className="w-full"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-sm font-medium">
                  Responsável
                </Label>
                <Input
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Nome da pessoa responsável"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area" className="text-sm font-medium">
                  Área/Departamento
                </Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex: Desenvolvimento, Marketing"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">
                Data Limite
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Selecionar data limite</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="progress">Em Progresso</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Prioridade</Label>
                <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Baixa
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Média
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Alta
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os detalhes da tarefa (opcional)"
              className="min-h-[80px] resize-none"
            />
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="evolutions">Evoluções</TabsTrigger>
              <TabsTrigger value="files">Arquivos</TabsTrigger>
              <TabsTrigger value="research">Pesquisas</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="results" className="text-sm font-medium">
                    Resultados
                  </Label>
                  <Textarea
                    id="results"
                    value={results}
                    onChange={(e) => setResults(e.target.value)}
                    placeholder="Descreva os resultados obtidos..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tests" className="text-sm font-medium">
                    Testes
                  </Label>
                  <Textarea
                    id="tests"
                    value={tests}
                    onChange={(e) => setTests(e.target.value)}
                    placeholder="Descreva os testes realizados..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="evolutions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newEvolution}
                    onChange={(e) => setNewEvolution(e.target.value)}
                    placeholder="Adicione uma nova evolução..."
                    className="flex-1 min-h-[80px]"
                  />
                  <Button
                    type="button"
                    onClick={addEvolution}
                    disabled={!newEvolution.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {evolutions.map((evolution) => (
                    <Card key={evolution.id} className="p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{evolution.content}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(evolution.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvolution(evolution.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {evolutions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma evolução adicionada ainda
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attachments" className="text-sm font-medium">
                    Anexar Arquivos
                  </Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {attachments.map((attachment) => (
                    <Card key={attachment.id} className="p-3">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {attachments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum arquivo anexado ainda
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="research" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="research" className="text-sm font-medium">
                  Pesquisas e Referências
                </Label>
                <Textarea
                  id="research"
                  value={research}
                  onChange={(e) => setResearch(e.target.value)}
                  placeholder="Adicione links, referências, pesquisas realizadas..."
                  className="min-h-[200px] resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim()}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-glow hover:to-secondary/90"
            >
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}