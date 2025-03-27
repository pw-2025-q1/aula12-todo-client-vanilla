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

        const querySelector = <T extends HTMLElement>(selector: string): T => {
            const element = document.querySelector<T>(selector);
            if (!element) {
                elementNotFoundError(selector);
            }
            return element;
        };

        this.newTodoInput = querySelector<HTMLInputElement>('#new-todo');
        this.addTodoButton = querySelector<HTMLButtonElement>('#add-todo');
        this.todoList = querySelector<HTMLUListElement>('#todo-list');
        this.todoItemTemplate = querySelector<HTMLTemplateElement>('#todo-item-template');

        this.addTodoButton.addEventListener('click', (ev) => {
            ev.preventDefault();
            this.handleAddTodo();
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
        const templateFragment = this.todoItemTemplate.content.cloneNode(true) as DocumentFragment;

        const todoText = templateFragment.querySelector<HTMLParagraphElement>('.todo-text');
        if (!todoText) {
            throw new Error('Template is missing .todo-text element');
        }
        todoText.textContent = todo.description;

        const articleElement = templateFragment.querySelector<HTMLElement>('article');
        if (!articleElement) {
            throw new Error('Template is missing article element');
        }
        articleElement.setAttribute('data-id', todo.id.toString());

        const deleteButton = templateFragment.querySelector<HTMLButtonElement>('.delete-todo');
        if (!deleteButton) {
            throw new Error('Template is missing .delete-todo button');
        }
        deleteButton.addEventListener('click', () => this.handleDeleteTodo(todo.id));

        const firstElementChild = templateFragment.firstElementChild;
        if (!firstElementChild || !(firstElementChild instanceof HTMLElement)) {
            throw new Error('Template does not have a valid root element');
        }

        return firstElementChild;
    }
}
