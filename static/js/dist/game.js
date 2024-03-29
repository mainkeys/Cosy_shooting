class AcGameMenu {
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode')
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings')
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }
    show() { //显示菜单界面
        this.$menu.show();
    }

    hide() { //关闭菜单界面
        this.$menu.hide();
    }
}

let BASE_OBJECTS = [];

class BaseObject {
    constructor(){
        BASE_OBJECTS.push(this);
        this.has_called_start = false;//是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔
    }
    start() {//只会在第一帧执行一次

    }
    update() {//每一帧都会执行一次

    }
    on_destory() {//在被销毁前执行一次

    }

    destroy() {
        for(let i = 0; i < BASE_OBJECTS.length; i++) {
            if(BASE_OBJECTS[i] === this) {
                BASE_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    for(let i = 0; i < BASE_OBJECTS.length; i++) {
        let obj = BASE_OBJECTS[i];
        if(!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);


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
class Particle extends BaseObject {
    constructor(playground, x, y, radius,vx, vy,  color, speed, move_length) { 
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x; 
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;

    } 
    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
        }
        let moved = Math.min(this.move_length, this.speed *this.timedelta / 1000 );
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        
        this.render();
    }

    render () {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends BaseObject {
    constructor(playground, x, y , radius ,color, speed, is_me, id) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.fireballSpeed = this.playground.height * 0.8;
        this.is_me = is_me;
        this.id = id;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spend_time = 0;//游戏已过时间
        this.cur_skill = null;
    }
    start() {
        if(this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        const rect = outer.ctx.canvas.getBoundingClientRect();
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if(e.which === 3) {
                outer.move_to(outer.mouseX - rect.left, outer.mouseY - rect.top);
            }
            // else if (e.which === 1) {
            //     if (outer.cur_skill === "fireball" ) {
            //         outer.shoot_fireball(e.clientX, e.clientY);
            //     }
            // }
        });
        $(window).mousemove(function(e) {
            outer.mouseX = e.pageX;
            outer.mouseY = e.pageY;
        })
        $(window).keydown(function(e) {
            if(e.which === 81) {
                // outer.cur_skill = "fireball";
                outer.shoot_fireball(outer.mouseX, outer.mouseY);
                // outer.cur_skill = null;
                return false;
            }else if(e.which === 83) {
                outer.move_length = 0;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty-this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color,  this.fireballSpeed, move_length, this.playground.height * 0.01 );
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for(let i = 0; i < 20 + Math.random() * 5; i ++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random()  * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);

        }
        this.radius -= damage;
        if (this.radius < 15) {
            this.on_destroy();
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage *100;
        this.speed *= 1.25;



    }

    update() {
        this.spend_time += this.timedelta / 1000;

        if (!this.is_me && this.spend_time > 5 && Math.random() < this.timedelta /3000 ) { //当游戏开始5s后，且隔5秒开始发射
            let myId = this.id;
            let players = this.playground.players;
            let myIndex = players.indexOf(myId);
            let enemies = this.playground.players;
            if (myIndex !== -1){
                enemies.splice(myIndex, 1);
            }
            let player =  enemies[Math.floor(Math.random() * enemies.length)];
            // let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.8;
            // let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.8;

            let fvx = (player.x + player.vx * player.speed - this.x) / this.fireballSpeed;
            let fvy = (player.y + player.vy * player.speed - this.y) / this.fireballSpeed;
            //let tx = this.x + fvx//解方程算出目标地点
            //let ty = this.y + fvy;
            //
            let A = fvx * this.vx, B = this.vy * fvx, C = this.vx * fvy, D = this.vy * fvy;
            let tx = ((this.y - player.y) * A + B * player.x - C * this.x) / (B - C);
            let ty = ((player.x - this.x) * D + B * this.y - C * player.y) / (B - C);
            if(player.id !== this.id){ //敌人存活且目标不是自己
                console.log("target"+tx,ty);
                this.shoot_fireball(tx, ty);
            }

        }
        if(this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if(this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    on_destroy() {
        let idToDelete = this.id;
        let indexToDelete = this.playground.players.findIndex(function(player) {
            return player.id === idToDelete;//寻找需要删除的player的id的对应的下标
        });
        this.playground.players.splice(indexToDelete, 1);

    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class FireBall extends BaseObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if(this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if (this.player.id !== player.id && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1  - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x)
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
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
export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);

        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}

