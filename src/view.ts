import { TodoRepository, TodoItem } from './model';

export class TodoView {
    private todoRepository: TodoRepository;
    private newTodoInput: HTMLInputElement;
    private addTodoButton: HTMLButtonElement;
    private todoList: HTMLUListElement;
    private todoItemTemplate: HTMLTemplateElement;

    constructor(todoRepository: TodoRepository) {
        this.todoRepository = todoRepository;

        function elementNotFoundError(selector: string): never {
            throw new Error(`Element not found: ${selector}`);
        }

        this.newTodoInput = document.querySelector('#new-todo')
            ?? elementNotFoundError('#new-todo');
        this.addTodoButton = document.querySelector('#add-todo')
            ?? elementNotFoundError('#add-todo');
        this.todoList = document.querySelector('#todo-list')
            ?? elementNotFoundError('#todo-list');
        this.todoItemTemplate = document.querySelector('#todo-item-template')
            ?? elementNotFoundError('#todo-item-template');

        this.addTodoButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.handleAddTodo()
        });
    }

    private async handleAddTodo() {
        const description = this.newTodoInput.value.trim();

        if (!description) return;

        try {
            await this.todoRepository.insert({ 
                id: 0,
                description: description
            });
            this.newTodoInput.value = ''; // Clear input field
            await this.refreshTodoList(); // Refresh the entire list
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }

    private async handleDeleteTodo(id: number) {
        try {
            await this.todoRepository.delete(id);
            await this.refreshTodoList(); // Refresh the entire list
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    async refreshTodoList() {
        try {
            const todos = await this.todoRepository.getAll();
            this.renderTodoList(todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    }

    private renderTodoList(todos: TodoItem[]) {
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }
        todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });
    }

    private createTodoElement(todo: TodoItem): HTMLElement {
        const todoElement = this.todoItemTemplate.content.cloneNode(true) as HTMLElement;
        const todoText = todoElement.querySelector('.todo-text') as HTMLElement;
        const deleteButton = todoElement.querySelector('.delete-todo') as HTMLButtonElement;
        const articleElement = todoElement.querySelector('article') as HTMLElement;

        todoText.textContent = todo.description;
        articleElement.setAttribute('data-id', todo.id.toString());
        deleteButton.addEventListener('click', () => this.handleDeleteTodo(todo.id));

        return todoElement.firstElementChild as HTMLElement;
    }
}
