const socket = io();

        //capturar el nombre del usuario
        const nicknameInput = prompt('Ingrese su nombre');

        const form = document.getElementById('form');
        const input = document.getElementById('input');

        const agregarMensaje = (data) => {
            const item = document.createElement('li');
            const timestamp = new Date().toLocaleString();
            item.textContent = `${timestamp}|${data}`;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }

        socket.emit('user connected', nicknameInput); // Envía el evento 'user connected' con el nombre del usuario

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (input.value && nicknameInput) {
                socket.emit('chat message', { nickname: nicknameInput, message: input.value });

                //muestra el mensaje del usuario que lo mando sin tener que recibirlo de vuelta
                agregarMensaje(`${nicknameInput}: ${input.value}`)

                input.value = '';
            }
        });
        socket.on('chat message', function (msg) {
            agregarMensaje(msg)
        });

        socket.on('ALLmsg', data => {
            data.map(msg => {
                agregarMensaje(msg);
            })
        })

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });