import { useState, useMemo } from 'react';
import { Clock, User, Calendar, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/types/task';
import { format, startOfQuarter, endOfQuarter, getQuarter, getYear, eachMonthOfInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

type ViewMode = 'quarter' | 'year';

export const TimelineView = ({ tasks, onEditTask }: TimelineViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('quarter');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getQuarterName = (quarter: number) => {
    return `Q${quarter}`;
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-muted-foreground';
      default: return 'border-l-border';
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

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'quarter') {
      const currentQuarter = getQuarter(currentDate);
      const currentYear = getYear(currentDate);
      
      if (direction === 'next') {
        if (currentQuarter === 4) {
          newDate.setFullYear(currentYear + 1, 0, 1);
        } else {
          newDate.setMonth((currentQuarter) * 3, 1);
        }
      } else {
        if (currentQuarter === 1) {
          newDate.setFullYear(currentYear - 1, 9, 1);
        } else {
          newDate.setMonth((currentQuarter - 2) * 3, 1);
        }
      }
    } else {
      if (direction === 'next') {
        newDate.setFullYear(getYear(currentDate) + 1, 0, 1);
      } else {
        newDate.setFullYear(getYear(currentDate) - 1, 0, 1);
      }
    }
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (task.dueDate && isSameDay(new Date(task.dueDate), date)) return true;
      if (isSameDay(new Date(task.createdAt), date)) return true;
      return false;
    });
  };

  const getTasksForMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return tasks.filter(task => {
      if (task.dueDate && isWithinInterval(new Date(task.dueDate), { start, end })) return true;
      if (isWithinInterval(new Date(task.createdAt), { start, end })) return true;
      return false;
    });
  };

  const renderQuarterView = () => {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });
    const currentQuarter = getQuarter(currentDate);
    const currentYear = getYear(currentDate);

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {months.map((month, index) => {
            const monthTasks = getTasksForMonth(month);
            const days = eachDayOfInterval({
              start: startOfMonth(month),
              end: endOfMonth(month)
            });

            return (
              <Card key={index} className="h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {getMonthName(month.getMonth())} {month.getFullYear()}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {monthTasks.length} tarefa{monthTasks.length !== 1 ? 's' : ''}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div key={day} className="text-xs text-center font-medium text-muted-foreground p-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {/* Dias vazios no início do mês */}
                    {Array.from({ length: startOfMonth(month).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8"></div>
                    ))}
                    
                    {days.map(day => {
                      const dayTasks = getTasksForDate(day);
                      const hasImportantTasks = dayTasks.some(task => task.priority === 'high');
                      
                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            h-8 flex items-center justify-center text-xs relative rounded cursor-pointer
                            ${isSameMonth(day, month) ? 'text-foreground' : 'text-muted-foreground'}
                            ${dayTasks.length > 0 ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'}
                            ${hasImportantTasks ? 'ring-1 ring-destructive' : ''}
                          `}
                          onClick={() => dayTasks.length > 0 && onEditTask(dayTasks[0])}
                        >
                          {day.getDate()}
                          {dayTasks.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center">
                              {dayTasks.length > 9 ? '9+' : dayTasks.length}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {monthTasks.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                      {monthTasks.slice(0, 5).map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded border-l-2 cursor-pointer hover:bg-muted/50 ${getPriorityColor(task.priority)}`}
                          onClick={() => onEditTask(task)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate">{task.title}</span>
                            <Badge variant={getStatusColor(task.status)} className="text-xs">
                              {task.status === 'todo' ? 'À Fazer' : 
                               task.status === 'progress' ? 'Progresso' : 'Concluído'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {monthTasks.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{monthTasks.length - 5} tarefa{monthTasks.length - 5 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const currentYear = getYear(currentDate);
    const quarters = [1, 2, 3, 4];

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quarters.map(quarter => {
          const quarterStart = new Date(currentYear, (quarter - 1) * 3, 1);
          const quarterEnd = endOfQuarter(quarterStart);
          const quarterTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
            return isWithinInterval(taskDate, { start: quarterStart, end: quarterEnd });
          });

          return (
            <Card key={quarter} className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">
                  {getQuarterName(quarter)} {currentYear}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {quarterTasks.length} tarefa{quarterTasks.length !== 1 ? 's' : ''}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quarterTasks.slice(0, 8).map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded border-l-2 cursor-pointer hover:bg-muted/50 ${getPriorityColor(task.priority)}`}
                      onClick={() => onEditTask(task)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{task.title}</span>
                        <Badge variant={getStatusColor(task.status)} className="text-xs">
                          {task.status === 'todo' ? 'À Fazer' : 
                           task.status === 'progress' ? 'Progresso' : 'Concluído'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.dueDate && (
                          <span>{format(new Date(task.dueDate), 'dd/MM', { locale: ptBR })}</span>
                        )}
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {quarterTasks.length > 8 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{quarterTasks.length - 8} tarefa{quarterTasks.length - 8 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Visão Cronológica</h2>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'quarter' 
                ? `${getQuarterName(getQuarter(currentDate))} ${getYear(currentDate)}`
                : `Ano ${getYear(currentDate)}`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Visualização..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quarter">Trimestre</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {viewMode === 'quarter' ? renderQuarterView() : renderYearView()}
      
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
          <p className="text-muted-foreground">
            Crie sua primeira tarefa para ver a visão cronológica
          </p>
        </div>
      )}
    </div>
  );
};