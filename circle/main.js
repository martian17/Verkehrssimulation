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

const drawLine = function(v, a, b, color){
    const s = moveVector(v, a);
    const e = moveVector(v, b);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(...s);
    ctx.lineTo(...e);
    ctx.stroke();
}

const findCross = function(v1, v2){
    // first normalize
    v1 = normalize(v1);
    v2 = normalize(v2);

    const b = ((v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2]) / ((v2[2])/v1[2] - (v2[3])/v1[3]);
    const a = (v2[0]+v2[2]*b-v1[0])/v1[2];

    return moveVector(v1, a);
}

const vecsub = function(v1,v2){
    let res = [];
    for(let i = 0; i < v1.length; i++){
        res[i] = v1[i] - v2[i];
    }
    return res;
}

const atan2v = function(vec){
    return Math.atan2(vec[1],vec[0]);
};

const getCrossWithScales = function(v1,v2){
    // first normalize
    v1 = normalize(v1);
    v2 = normalize(v2);

    const b = ((v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2]) / ((v2[2])/v1[2] - (v2[3])/v1[3]);
    const a = (v2[0]+v2[2]*b-v1[0])/v1[2];

    return [moveVector(v1, a),a,b];
}

const drawVector = function(v1,v2, progress){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // first normalize
    v1 = normalize(v1);
    v2 = normalize(v2);

    //x:  v1[0]+v1[2]*a == v2[0]+v2[2]*b;
    //y:  v1[1]+v1[3]*a == v2[1]+v2[3]*b;
    
    //x:  a == (v2[0]+v2[2]*b-v1[0])/v1[2];
    //y:  a == (v2[1]+v2[3]*b-v1[1])/v1[3];
    
    // (v2[0]+v2[2]*b-v1[0])/v1[2] == (v2[1]+v2[3]*b-v1[1])/v1[3];

    // (v2[2]*b)/v1[2]+(v2[0]-v1[0])/v1[2] == (v2[3]*b)/v1[3]+(v2[1]-v1[1])/v1[3];

    // (v2[2]*b)/v1[2] - (v2[3]*b)/v1[3] ==  (v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2];
    
    // b*((v2[2])/v1[2] - (v2[3])/v1[3]) ==  (v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2];
    
    // b == ((v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2]) / ((v2[2])/v1[2] - (v2[3])/v1[3]);
    
    const b = ((v2[1]-v1[1])/v1[3] - (v2[0]-v1[0])/v1[2]) / ((v2[2])/v1[2] - (v2[3])/v1[3]);
    const a = (v2[0]+v2[2]*b-v1[0])/v1[2];

    let as = 0;
    let bs = 0;
    if(a < b){
        bs = b-a;
        drawLine(v2,0,bs,"#0f0");
    }else{
        as = a-b;
        drawLine(v1,0,as,"#0f0");
    }
    drawLine(v1,0,-100,"#f0f");
    drawLine(v2,0,-100,"#f00");

    drawLine(v1,as,a,"#00f");
    drawLine(v2,bs,b,"#00f");


    // now find the circle

    const v11 = [...moveVector(v1,as),-v1[3],v1[2]];
    const v21 = [...moveVector(v2,bs),-v2[3],v2[2]];

    const [cross,ac,bc] = getCrossWithScales(v11,v21);
    const r1 = dist(cross, moveVector(v1,as));
    console.log(cross,r1);

    const v1d = moveVector(v1,as); 
    const v2d = moveVector(v2,bs);
    let rad1 = atan2v(vecsub(v1d,cross));
    let rad2 = atan2v(vecsub(v2d,cross));
    let dflag = true;
    if(rad2 < rad1){
        dflag = !dflag;
        [rad2, rad1] = [rad1, rad2];
    }
    if(rad2 - rad1 > Math.PI){
        dflag = !dflag;
        [rad2, rad1] = [rad1, rad2];
        rad1 -= Math.PI*2;
    }
    
    console.log(rad1,rad2);

    ctx.strokeStyle = "#000";
    ctx.beginPath()
    ctx.arc(...cross,r1,rad1, rad2);
    ctx.stroke();

    const sl1 = dist(v1,v1d);
    const sl2 = (rad2-rad1)*r1;
    const sl3 = dist(v2,v2d);

    const lsum = sl1 + sl2 + sl3;

    const realProgress = progress * lsum;

    let pos;
    if(realProgress < sl1){
        pos = moveVector(v1,realProgress);
    }else if(realProgress < sl1 + sl2){
        let pp = (realProgress - (sl1))/sl2;
        if(!dflag)pp = 1-pp;
        const ang = rad1 + (rad2-rad1) * pp;
        pos = [cross[0]+Math.cos(ang)*r1,cross[1]+Math.sin(ang)*r1];
    }else{
        pos = moveVector(v2,(lsum - realProgress));
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(...pos,5,5);
}

const getRandomVector = function(){
    return normalize([Math.random()*400+50, Math.random()*400+50, Math.random()-0.5, Math.random()-0.5])
}

let sv, ev;

while(true){
    sv = getRandomVector();
    ev = getRandomVector();
    const [cross,a,b] = getCrossWithScales(sv,ev);
    if(cross[0] > 500 || cross[0] < 0 || cross[1] > 500 || cross[1] < 0){
        continue;
    }
    if(a <= 100 || b <= 100){
        continue;
    }
    break;
}
let t = 0;
while(true){
    t += 0.01;
    drawVector(
        sv,//[100,300,2,-1],
        ev,//[300,270,1,-2],
        t
    );
    await new Promise(res=>setTimeout(res,10));
}





