# ⚽ Super Gol - Desafio de 45 Segundos

Um emocionante jogo de futebol desenvolvido em **HTML5 Canvas**, **CSS Moderno (Glassmorphism)** e **JavaScript puro**.
O objetivo é marcar o maior número de gols possível em 45 segundos, superando um goleiro inteligente que protege a trave!

## 🚀 Como Jogar

1. O jogo começa com um cronômetro de 45 segundos.
2. **Mirar:** Use as **setas para a esquerda (⬅️) e direita (➡️)** para rotacionar a mira da bola no gramado.
3. **Chutar:** Pressione a **barra de ESPAÇO** para dar o chute.
4. **Desafio:** Um goleiro estará patrulhando a área do gol de um lado para o outro. Se a bola bater nele, ele faz a defesa!
5. Se a bola entrar na área central do gol, você marca um ponto e a bola reseta no centro.

## ✨ Características do Projeto

*   **Gráficos Pseudo-3D e Sprites:** O jogo usa artes digitais geradas para o gramado, a bola e o goleiro, perfeitamente integrados com remoção dinâmica de fundo via Canvas API (chroma-key manual de fundos brancos).
*   **Física de Atrito e Rotação:** A bola possui física simulada de atrito e rola visualmente enquanto desliza pelo gramado verde.
*   **Design de Interface Premium:**
    *   Uso da técnica de *Glassmorphism* (efeito de vidro translúcido).
    *   Sombras e gradientes neon vibrantes.
    *   Tipografia "Outfit" importada do Google Fonts.
    *   Pop-ups visuais explosivos e modernos para eventos como "GOL!" e "DEFENDEU!".
*   **Desenvolvimento Rápido:** Configurado para rodar perfeitamente com o servidor de desenvolvimento Vite.

## 🖼️ Sprites do Jogo

Aqui estão os ativos visuais (sprites) usados e gerados dinamicamente para o jogo:

### O Campo
![Campo de Futebol](./public/field.png)

### O Goleiro e a Bola
![Goleiro](./public/gk.png) ![Bola de Futebol](./public/ball.png)

---

## 🛠️ Como rodar localmente

Se você estiver rodando em sua máquina, o projeto utiliza o Vite como servidor de desenvolvimento.

1.  Certifique-se de ter o Node.js instalado.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor:
    ```bash
    npm run dev
    # ou usando npx diretamente
    npx vite
    ```
4.  Abra o link fornecido pelo Vite (geralmente `http://localhost:5173`) no seu navegador!

Divirta-se quebrando recordes! 🏆
