class ChatController {
    constructor({
        crearChat,
        listarChats,
        obtenerChat,
        obtenerChatsPorPersona,
        actualizarChat,
        eliminarChat }) {
        this.crearChat = crearChat;
        this.listarChats = listarChats;
        this.obtenerChat = obtenerChat;
        this.obtenerChatsPorPersona = obtenerChatsPorPersona;
        this.actualizarChat = actualizarChat;
        this.eliminarChat = eliminarChat;
    }

    crear = async (req, res, next) => {
        try {
            const chat = await this.crearChat.execute(req.body);
            res.status(201).json(chat);
        } catch (error) {
            next(error);
        }
    };

    listar = async (req, res, next) => {
        try {
            const chats = await this.listarChats.execute();
            res.json(chats);
        } catch (error) {
            next(error);
        }
    };

    obtener = async (req, res, next) => {
        try {
            const chat = await this.obtenerChat.execute(req.params.id);
            res.json(chat);
        } catch (error) {
            next(error);
        }
    };

    obtenerPorPersona = async (req, res, next) => {
        try {
            const chats = await this.obtenerChatsPorPersona.execute(req.params.personaId);
            res.json(chats);
        } catch (error) {
            next(error);
        }
    };

    actualizar = async (req, res, next) => {
        try {
            const chat = await this.actualizarChat.execute(req.params.id, req.body);
            res.json(chat);
        } catch (error) {
            next(error);
        }
    };

    eliminar = async (req, res, next) => {
        try {
            await this.eliminarChat.execute(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = ChatController;