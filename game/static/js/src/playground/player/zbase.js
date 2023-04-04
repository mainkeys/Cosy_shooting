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
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if(e.which === 3) {
                outer.move_to(outer.mouseX, outer.mouseY);
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
            let tx = this.x + (player.x + player.vx * player.speed - this.x) / this.fireballSpeed;//解方程算出目标地点

            let ty = this.y + (player.y + player.vy * player.speed - this.y) / this.fireballSpeed;
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
