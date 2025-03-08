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
   TAs e TVs, quando um TA solicitar uma nova SEA. Para cada duas SEAs do tipo P
   informadas, a próxima SEA deverá ser obrigatoriamente do tipo N, se houver.
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
