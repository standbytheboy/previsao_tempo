# Previsão do Tempo

Este é um aplicativo web simples para exibir a previsão do tempo de uma cidade, mostrando as condições atuais e a previsão para os próximos 5 dias.

## Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias:

* **HTML5:** Para a estrutura da página.
* **CSS3:** Para a estilização e design. O projeto utiliza o framework **Tailwind CSS** para um estilo moderno e responsivo.
* **JavaScript:** Para a lógica da aplicação, manipulação do DOM e comunicação com a API.
* **OpenWeather API:** Utilizada para obter os dados do clima.

## Como a API Funciona

Este aplicativo utiliza a API gratuita **"5 day / 3 hour forecast"** da OpenWeather.

1.  A aplicação faz uma chamada única para a API, que retorna dados de previsão para os próximos 5 dias em intervalos de 3 horas.
2.  Uma função em JavaScript (`processForecastData`) é responsável por processar esses dados. Ela agrupa todas as medições de 3 em 3 horas para cada dia.
3.  Para cada dia, a função calcula a temperatura mínima e máxima, garantindo que a previsão diária seja precisa, mesmo com a limitação da API gratuita.

## Instalação e Execução

Para executar o projeto, siga os passos abaixo:

1.  Clone este repositório para o seu computador.
2.  Abra o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Firefox, Edge, etc.).

A aplicação será carregada automaticamente e você poderá pesquisar a previsão do tempo de qualquer cidade.
