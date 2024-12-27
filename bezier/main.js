const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const width = canvas.width = 500;
const height = canvas.height = 500;

document.body.appendChild(canvas);

const normalize = function([a,b,c,d]){
    const r = Math.sqrt(c*c+d*d);
    return [a,b,c/r,d/r];
}

const dist = function(v1, v2){// length 2
    return Math.sqrt((v1[0]-v2[0])**2 + (v1[1]-v2[1])**2);
}

const moveVector = function(v, s){
    return [v[0]+v[2]*s, v[1]+v[3]*s];
}

const linearIntp = function(p1, p2, r){
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return [p1[0] + dx*r, p1[1] + dy*r];
}

class CubicBezier{
    constructor(c1, c2, c3, c4){
        this.c1 = c1;
        this.c2 = c2;
        this.c3 = c3;
        this.c4 = c4;
    }
    static fromVectors(v1, v2){
        v1 = normalize(v1);
        v2 = normalize(v2);
        const d = dist(v1,v2);
        const r = d/2;
        const m1 = moveVector(v1, r);
        const m2 = moveVector(v2, -r);
        return new CubicBezier(v1, m1, m2, v2);
    }
    interpolate(r){
        const {c1,c2,c3,c4} = this;
        const d1 = linearIntp(c1,c2,r);
        const d2 = linearIntp(c2,c3,r);
        const d3 = linearIntp(c3,c4,r);

        const e1 = linearIntp(d1,d2,r);
        const e2 = linearIntp(d2,d3,r);

        return linearIntp(e1,e2,r);
    }
    _length = null;
    get length(){
        if(this._length !== null)return this._length;
        const step = 0.001;
        let prev = this.c1;
        let sum = 0;
        for(let i = step; i <= 1; i += 0.001){
            let next = this.interpolate(i);
            sum += dist(prev,next);
            prev = next;
        }
        this._length = sum;
        return sum;
    }
}

const drawArrow = function(vec, len, color){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(vec[0],vec[1]);
    ctx.lineTo(...moveVector(vec,len));
    ctx.stroke();
}

const drawLine = function(p1, p2, color){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(...p1);
    ctx.lineTo(...p2);
    ctx.stroke();
}

const getRoad = function(){
    let prev = getRandomVector();
    let vectors = [prev];
    let r = 150;
    for(let i = 0; i < 20; i++){
        while(true){
            let next = [prev[0]+(Math.random()-0.5)*r, prev[1]+(Math.random()-0.5)*r, Math.random()-0.5, Math.random()-0.5];
            next = normalize(next);
            if(next[0] < 50 || next[0] > 450 || next[1] < 50 || next[1] > 450)continue;
            prev = next;
            vectors.push(next);
            break;
        }
    }
    // connect the vectors
    let totalLength = 0;
    const curves = [];
    for(let i = 1; i < vectors.length; i++){
        const v1 = vectors[i-1];
        const v2 = vectors[i];
        const b = CubicBezier.fromVectors(v1,v2);
        totalLength += b.length;
        curves.push(b);
    }
    return {
        curves, length: totalLength
    };
}

const drawRoad = function(road, r){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    let currentProgress = road.length * r;
    for(let b of road.curves){
        drawLine(b.c1,b.c2,"#0f0");
        drawLine(b.c3,b.c4,"#0f0");
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        for(let i = 0; i < 1; i+= 0.01){
            ctx.lineTo(...b.interpolate(i));
        }
        ctx.stroke();
        
        if(currentProgress < b.length){
            const rc = currentProgress/b.length
            console.log(rc);
            ctx.fillStyle = "#00f";
            ctx.fillRect(...b.interpolate(rc),5,5);
            currentProgress = Infinity;
        }
        currentProgress -= b.length;
    }
}


// const drawVector = function(v1, v2, r){
//     ctx.clearRect(0,0,canvas.width, canvas.height);
//     const b = CubicBezier.fromVectors(v1,v2);
//     drawArrow(v1,50,"#0f0");
//     drawArrow(v2,-50,"#0f0");
//     ctx.strokeStyle = "#000";
//     ctx.beginPath();
//     for(let i = 0; i < 1; i+= 0.01){
//         ctx.lineTo(...b.interpolate(i));
//     }
//     ctx.stroke();
// 
//     ctx.fillStyle = "#00f";
//     ctx.fillRect(...b.interpolate(r),5,5);
// }

const getRandomVector = function(){
    return normalize([Math.random()*400+50, Math.random()*400+50, Math.random()-0.5, Math.random()-0.5])
}

const road = getRoad();

let t = 0;
while(true){
    t += 0.001;
    drawRoad(
        road,
        t
    );
    await new Promise(res=>setTimeout(res,10));
}


// let sv, ev;
// 
// while(true){
//     sv = getRandomVector();
//     ev = getRandomVector();
//     // const [cross,a,b] = getCrossWithScales(sv,ev);
//     // if(cross[0] > 500 || cross[0] < 0 || cross[1] > 500 || cross[1] < 0){
//     //     continue;
//     // }
//     // if(a <= 100 || b <= 100){
//     //     continue;
//     // }
//     break;
// }
// let t = 0;
// while(true){
//     t += 0.01;
//     drawVector(
//         sv,//[100,300,2,-1],
//         ev,//[300,270,1,-2],
//         t
//     );
//     await new Promise(res=>setTimeout(res,10));
// }





