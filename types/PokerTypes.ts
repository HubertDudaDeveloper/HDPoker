export interface User {
    [key: string]: string | object | [] | number | undefined;
    id: string;
    name: string;
    image: string;
    points: number | string;
}

export interface Room {
    [key: string]: string | object | [] | number | boolean | undefined;
    id: string;
    name: string;
    points: number | string;
    users: User[] | string;
    revealed: boolean;
    tasks: string;
    votes: [];
    messages: [];
}

export interface Task {
    [key: string]: string | object | [] | number | boolean | undefined;
    id: string;
    name: string;
    link: string;
    points: number | string;
    status: string;
}

export interface extWebSocket extends WebSocket {
    me: User;
    room: Room;
}

export enum Stores {
    LOGIN_STORE = 'LoginStore',
    ROOM_STORE = 'RoomStore',
    USERS_STORE = 'UsersStore',
    POKER_STORE = 'PokerStore',
    CARDS_STORE = 'CardsStore',
    TASKS_STORE = 'TasksStore',
}

export enum MessageType {
    INIT = 'init', //stwórz pokój
    VOTE = 'vote', //zagłosuj w pokoju
    RESET = 'reset', //zresetuj głosy w pokoju
    JOIN = 'join', //dołącz do pokoju
    LEAVE = 'leave', //opuść pokój
    MESSAGE = 'message', //wyslij wiadomość w pokoju
    TASK = 'task', // ustaw/usuń/edytuj task w pokoju
    REVEAL = 'reveal', // odkryj głosy w pokoju
    UPDATE = 'update', // zaktualizuj pokój
    ERROR = 'error', // zaktualizuj pokój
}


