class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();

        this.start();

    }

    get_random_color () {
        let colors = ["blue", "red", "pink", "gray", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }
    start() {
    }
    show(){//显示playground界面
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true, 0));
        for(let i = 1; i <= 5; i ++) {
            let color = this.get_random_color();
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, color, this.height * 0.15, false, i));
        }
        this.$playground.show();
    }
    hide(){//关闭playground界面
        this.$playground.hide();
    }
}
