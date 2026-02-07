class ListarChats {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute() {
        return await this.chatRepository.listar();
    }
}

module.exports = ListarChats;