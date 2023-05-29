interface Task {
  id: string;
  func: () => any;
  priority: number;
}

class TaskQueue {
  private readonly queue: Array<Task>;
  private isRunning: boolean;
  private cancelTasks: Set<string>;

  constructor() {
    this.queue = [];
    this.isRunning = false;
    this.cancelTasks = new Set();
  }

  public async addTask(func: () => any, priority: number = 0) {
    const id = crypto.randomUUID();
    const task: Task = {id, func, priority};

    if (this.cancelTasks.has(id)) {
      throw new Error(`Task with id ${id} has been cancelled.`);
    }
    
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);

    if (!this.isRunning) {
      this.runNextTask();
    }

    return id;
  }

  public cancelTask(taskId: string) {
    this.cancelTasks.add(taskId);
  }

  private async runNextTask() {
    if (this.queue.length === 0) {
      this.isRunning = false;
      return;
    }

    this.isRunning = true;
    const nextTask = this.queue.shift();

    if (nextTask) {
      if (this.cancelTasks.has(nextTask.id)) {
        console.log(`Task with id ${nextTask.id} has been cancelled.`);
        this.runNextTask();
      } else {
        try {
          await nextTask.func();
        } catch (error) {
          console.error(`Task with id ${nextTask.id} failed with error: ${error}`);
        }
      }
    }

    this.runNextTask();
  }
}
