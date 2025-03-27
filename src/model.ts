export interface TodoItem {
    id: number;
    description: string;
    tags?: string[];
    deadline?: string;
}

interface TodoListDTO {
    status: string;
    items: TodoItem[];
}

const RA = ""; // TODO: seu RA aqui
const API_BASE_URL = `https://todo-server-spa-748269297649.southamerica-east1.run.app/api/${RA}`;

interface Repository<T> {
    getAll(sorted: boolean): Promise<T[]>;
    insert(todo: T): Promise<void>;
    delete(id: number): Promise<void>;
}

export class TodoRepository implements Repository<TodoItem> {
    async getAll(sorted: boolean = false): Promise<TodoItem[]> {
        const response = await fetch(`${API_BASE_URL}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch todos: ${await response.text()}`);
        }
        
        const items = (await response.json() as TodoListDTO).items;

        // Sort the items by description
        return sorted ? items.sort((a, b) => a.description.localeCompare(b.description)) : items;
    }

    async insert(todo: TodoItem): Promise<void> {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todo),
        });
        if (!response.ok) {
            throw new Error(`Failed to create todo: ${await response.text()}`);
        } 
    }

    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete todo with id ${id}: ${await response.text()}`);
        }
    }
}