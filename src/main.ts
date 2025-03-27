import { TodoRepository } from './model';
import { TodoView } from './view';

const todoRepository = new TodoRepository();
const todoView = new TodoView(todoRepository);

todoView.refreshTodoList();
