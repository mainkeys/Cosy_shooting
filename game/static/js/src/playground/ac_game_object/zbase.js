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


