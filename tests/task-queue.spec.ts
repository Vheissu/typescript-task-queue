import { TaskQueue } from 'task-queue';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('TaskQueue', () => {
  let taskQueue: TaskQueue;

  beforeEach(() => {
    taskQueue = new TaskQueue();
  });

  test('adds a task to the queue', async () => {
    const task = jest.fn();
    await taskQueue.addTask(task);
    expect(task).toHaveBeenCalled();
  });

  test('tasks are executed in priority order', async () => {
    const results: number[] = [];
    const highPriorityTask = () => results.push(2);
    const lowPriorityTask = () => results.push(1);

    await taskQueue.addTask(lowPriorityTask, 1);
    await taskQueue.addTask(highPriorityTask, 2);

    await sleep(100); // Enough time for both tasks to have been executed

    expect(results).toEqual([2, 1]);
  });

  test('can cancel a task', async () => {
    const task = jest.fn();
    const taskId = await taskQueue.addTask(task);

    taskQueue.cancelTask(taskId);
    
    await sleep(100); // Enough time for the task to be canceled and not executed

    expect(task).not.toHaveBeenCalled();
  });

  test('handles task errors', async () => {
    const errorTask = () => { throw new Error('Task failed'); };
    const task2 = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const taskId1 = await taskQueue.addTask(errorTask);
    const taskId2 = await taskQueue.addTask(task2);

    await sleep(100); // Enough time for both tasks to have been executed

    expect(consoleErrorSpy).toHaveBeenCalledWith(`Task with id ${taskId1} failed with error: Error: Task failed`);
    expect(task2).toHaveBeenCalled();
  });
});
