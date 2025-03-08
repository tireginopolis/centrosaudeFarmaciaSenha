# SISTEMA DE ATENDIMENTO POR SENHA ELETRÔNICA

# Sobre

<p> 
  Projeto para Farmácia do Centro de Saúde.
</p>

### Objetivo

<p>
  Um Sistema de Atendimento por Senha Eletrônica (SASE) consiste de uma solução de
  software distribuído, o qual gera automaticamente senhas eletrônicas visando aumento de
  qualidade no atendimento ao público, através o gerenciamento e aumento de eficiência de
  filas de pessoas em áreas de atendimento.

Comumente, um SASE inclui os seguintes elementos básicos:

1. Senha Eletrônica de Atendimento (SEA): identificação disponibilizada ao
   público e utilizada para ordenar os atendimentos;
2. Terminal de Senhas (TS): dispositivo utilizado pelo público para geração de
   senhas;
3. Terminal de Atendimento (TA): local onde serão atendidas as pessoas que
   receberam uma senha, gerada previamente no TS;
4. Terminal de Visualização (TV): dispositivo que mostrará, em tempo real, as
   senhas e os respectivos TAs, em atendimento;
5. Servidor (SRV): computador que guardará informações sobre as senhas geradas,
senhas que estão em atendimento ou aquelas que já foram atendidas.
</p>

### Especificação

### Programação da solução

<p>O SASE a ser desenvolvido deverá atender às seguintes especificações:</p>

1. Incluir os módulos distribuídos: TS, TA, TV e SRV;
2. Ser Implementado em qualquer linguagem de programação;
3. Utilizar sockets para comunicação entre os módulos TS, TA, TV e SRV;
4. Os módulos devem:
5. TS: </br>(a) Gerar dois tipos de SEA: Normal (N) ou Prioritário (P); </br>
   (b) Gerar as SEAs em ordem crescente. Exs; N1, N2, N3, P1, P2, P3,... ;
   </br>(c) Enviar as SEAs geradas para o SRV;
6. TA:</br> (a) Solicitar uma SEA ao SRV; </br>(b) Receber, após solicitação,
   uma SEA do SRV;</br> (c) A SEA recebida deve ter sido gerada anteriormente no
   TS;</br> (d) Informar a SEA recebida;
7. TV:</br> (a) Receber uma SEA do servidor;</br> (b) A SEA recebida deve ter
   sido gerada anteriormente no TS; </br>(c) A SEA recebida deve ser a mesma
   solicitada e recebida por um TA;</br> (d) Informar a SEA recebida;
8. SRV:</br> (a) Registrar as SEAs geradas pelo TS; </br>(b) Informar o instante
   em que recebeu uma nova SEA do TS;</br> (c) Enviar as SEAs registradas aos
   TAs e TVs, quando um TA solicitar uma nova SEA. Para cada duas SEAs do tipo N
   informadas, a próxima SEA deverá ser obrigatoriamente do tipo P, se houver.
   </br> (d) Informar o instante em que enviou uma SEA para TA e TV.

# Tecnologias

- [Socket.IO](https://socket.io/)
- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/pt-br/)

# Como rodar

### No diretório inicial:

- #### `npm install`
- #### `npm start`

- #### Vai ser aberta a conexão na porta 3000, abra uma aba para cada conexão, também é possível abrir mais de uma aba para qualquer serviço.

<!-- I'll improve the queue logic to respect the overall insertion order between normal and priority queues, while still maintaining the "2 normal, then 1 priority" rule. This way, priority tickets won't be skipped in favor of newer normal tickets.
Improved Queue System with Insertion Order TrackingClick to open codeTap to open
I've significantly improved the queue system to respect both the "2 normal, then 1 priority" rule AND the overall insertion order. Here are the key changes:

Enhanced Ticket Structure: Each ticket now includes:

id: The visible ticket number (like "N1" or "P5")
sequence: A global insertion sequence number
type: Either "N" or "P"


Global Sequence Counter: Added a globalSequence variable that increments whenever any ticket is generated, tracking the exact order of ticket creation across both queues.
Improved Selection Logic: The getNextTicket() function now:

Handles empty queue cases gracefully
Enforces the "2 normal, then 1 priority" rule
When this rule doesn't force a selection, picks the oldest ticket based on sequence number
Properly updates the normalCount counter


Frontend Compatibility: Modified the sendQueueStatus() function to extract just the ticket IDs before sending to the frontend, maintaining compatibility with the existing UI.
Backup Updates: Added the new globalSequence variable to the backup system to ensure proper restoration after server restarts.

This solution ensures that:

Priority tickets won't be unfairly skipped in favor of newer normal tickets
The system still follows the "2 normal, then 1 priority" rule when possible
The overall insertion order is respected when there's no rule-based reason to choose one queue over the other -->