const pokerRepository = () => {
    

    interface Room {
        name: string;
        roomContent: {
            name: string;
            users: Record<string, string | number>[];
        };
    }

    const joinRoom = (roomName: string, user: Record<string, number | string>): Room => {
        const room = sessionStorage.getItem(roomName);
        if (room) {
            const roomData = JSON.parse(room);
            roomData.users.push(user);
            sessionStorage.setItem(roomName, JSON.stringify(roomData));
        } else {
            createRoom(roomName, user);
        }
        return JSON.parse(room as string);
    }

    const createRoom = (roomName: string, user: Record<string, number | string>): Room => {
        
        const room: Room = {
            name: roomName,
            roomContent: {
                name: roomName,
                users: [user],
            }
        }
        
        sessionStorage.setItem(
            room.name,
            JSON.stringify(room.roomContent)
        )
        return room;
    }
    
    return {
        joinRoom,
        createRoom,
    };
}

export default pokerRepository;