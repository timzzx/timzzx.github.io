var CanvasParticle = (function(){
	function getElementByTag(name){
		return document.getElementsByTagName(name);
	}
	function getELementById(id){
		return document.getElementById(id);
	}
	// ���ݴ����config��ʼ������
	function canvasInit(canvasConfig){
		canvasConfig = canvasConfig || {};
		var html = getElementByTag("html")[0];
		var body = getElementByTag("body")[0];
		var canvasDiv = getELementById("canvas-particle");
		var canvasObj = document.createElement("canvas");

		var canvas = {
			element: canvasObj,
			points : [],
			// Ĭ������
			config: {
				vx: canvasConfig.vx || 4,
				vy:  canvasConfig.vy || 4,
				height: canvasConfig.height || 2,
				width: canvasConfig.width || 2,
				count: canvasConfig.count || 100,
				color: canvasConfig.color || "121, 162, 185",
				stroke: canvasConfig.stroke || "130,255,255",
				dist: canvasConfig.dist || 6000,
				e_dist: canvasConfig.e_dist || 20000,
				max_conn: 10
			}
		};

		// ��ȡcontext
		if(canvas.element.getContext("2d")){
			canvas.context = canvas.element.getContext("2d");
		}else{
			return null;
		}

		body.style.padding = "0";
		body.style.margin = "0";
		// body.replaceChild(canvas.element, canvasDiv);
		body.appendChild(canvas.element);

		canvas.element.style = "position: absolute; top: 0; left: 0; z-index: -1;";
		canvasSize(canvas.element);
		window.onresize = function(){
			canvasSize(canvas.element);
		}
		body.onmousemove = function(e){
			var event = e || window.event;
			canvas.mouse = {
				x: event.clientX,
				y: event.clientY
			}
		}
		document.onmouseleave = function(){
			canvas.mouse = undefined;
		}
		setInterval(function(){
			drawPoint(canvas);
		}, 40);
	}

	// ����canvas��С
	function canvasSize(canvas){
		canvas.width = window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
		canvas.height = window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;
	}

	// ����
	function drawPoint(canvas){
		var context = canvas.context,
			point,
			dist;
		context.clearRect(0, 0, canvas.element.width, canvas.element.height);
		context.beginPath();
		context.fillStyle = "rgb("+ canvas.config.color +")";
		for(var i = 0, len = canvas.config.count; i < len; i++){
			if(canvas.points.length != canvas.config.count){
				// ��ʼ�����е�
				point = {
					x: Math.floor(Math.random() * canvas.element.width),
					y: Math.floor(Math.random() * canvas.element.height),
					vx: canvas.config.vx / 2 - Math.random() * canvas.config.vx,
					vy: canvas.config.vy / 2 - Math.random() * canvas.config.vy
				}
			}else{
				// ��������ٶȺ�λ�ã��������߽紦��
				point =	borderPoint(canvas.points[i], canvas);
			}
			context.fillRect(point.x - canvas.config.width / 2, point.y - canvas.config.height / 2, canvas.config.width, canvas.config.height);

			canvas.points[i] = point;
		}
		drawLine(context, canvas, canvas.mouse);
		context.closePath();
	}

	// �߽紦��
	function borderPoint(point, canvas){
		var p = point;
		if(point.x <= 0 || point.x >= canvas.element.width){
			p.vx = -p.vx;
			p.x += p.vx;
		}else if(point.y <= 0 || point.y >= canvas.element.height){
			p.vy = -p.vy;
			p.y += p.vy;
		}else{
			p = {
				x: p.x + p.vx,
				y: p.y + p.vy,
				vx: p.vx,
				vy: p.vy
			}
		}
		return p;
	}

	// ����
	function drawLine(context, canvas, mouse){
		context = context || canvas.context;
		for(var i = 0, len = canvas.config.count; i < len; i++){
			// ��ʼ�����������
			canvas.points[i].max_conn = 0;
			// point to point
			for(var j = 0; j < len; j++){
				if(i != j){
					dist = Math.round(canvas.points[i].x - canvas.points[j].x) * Math.round(canvas.points[i].x - canvas.points[j].x) + 
							Math.round(canvas.points[i].y - canvas.points[j].y) * Math.round(canvas.points[i].y - canvas.points[j].y);
					// �������С���������룬����С�����������������
					if(dist <= canvas.config.dist && canvas.points[i].max_conn <canvas.config.max_conn){
						canvas.points[i].max_conn++;
						// ����ԽԶ������Խϸ������Խ͸��
						context.lineWidth = 0.5 - dist / canvas.config.dist;
						context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.dist) +")"
						context.beginPath();
						context.moveTo(canvas.points[i].x, canvas.points[i].y);
						context.lineTo(canvas.points[j].x, canvas.points[j].y);
						context.stroke();

					}
				}
			}
			// ��������뻭��
			// point to mouse
			if(mouse){
				dist = Math.round(canvas.points[i].x - mouse.x) * Math.round(canvas.points[i].x - mouse.x) + 
						Math.round(canvas.points[i].y - mouse.y) * Math.round(canvas.points[i].y - mouse.y);
				// ���������������ʱ���٣�ֱ�Ӹı�point��x��yֵ�ﵽ����Ч��
				if(dist > canvas.config.dist && dist <= canvas.config.e_dist){
					canvas.points[i].x = canvas.points[i].x + (mouse.x - canvas.points[i].x) / 20;
					canvas.points[i].y = canvas.points[i].y + (mouse.y - canvas.points[i].y) / 20;
				}
				if(dist <= canvas.config.e_dist){
					context.lineWidth = 1;
					context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.e_dist) +")";
					context.beginPath();
					context.moveTo(canvas.points[i].x, canvas.points[i].y);
					context.lineTo(mouse.x, mouse.y);
					context.stroke();
				}
			}
		}
	}
	return canvasInit;
})();
$(function() {
    //����
    var config = {
        vx: 4,//��x���ٶ�,��Ϊ�ң���Ϊ��
        vy:  4,//��y���ٶ�
        height: 2,//��߿���ʵΪ�����Σ����Բ���̫��
        width: 2,
        count: 20,//�����
        color: "0,137,225",//����ɫ
        stroke: "0,137,224",//������ɫ
        dist: 6000,//����������
        e_dist: 20000,//����������پ���
        max_conn: 10//�㵽�����������
    }
    //����
    CanvasParticle(config);
});