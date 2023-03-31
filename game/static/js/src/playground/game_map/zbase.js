class GameMap extends BaseObject {//BaseObject基类的派生类
    constructor(playground) {
        super();//将自己注册到了BASE_OBJECTS[] 里
        this.playground = playground;
        this.$canvas = $(`<canvas> </canvas>`);
        this.ctx = this.$canvas[0].getContext("2d");
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    start() {

    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    };
}
