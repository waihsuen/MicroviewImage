/* jshint devel:true */


var canvas = document.getElementById("drawer"),
    context = canvas.getContext("2d"),
    imageDataArray = [];


$(document).ready(function() {
    
//    var byteArray = new Uint8Array(8);
//    console.log(typeof(byteArray[0]));
//    byteArray[0] = ~4<<1;
//    byteArray[0] = ~byteArray[0];
//    console.log(byteArray[0]);
//    console.log(byteArray[0].toString(2))
    
    
    createMapper();
    loadImagePath('./images/testimage.png'); 
    
    $('#imgInput').change(function(evt){
        loadImagePath(URL.createObjectURL(evt.target.files[0]));
    });
    
});

var loadImagePath = function(filePath) {
    context.fillStyle="#FFF";
    context.fillRect(0,0,64,48);
    imageDataArray = [];
    
    var imgWidth = 0,
        imgHeight = 0,
        scaleX = 0,
        scaleY = 0,
        scale = 0,
        moveL = 0,
        moveT = 0,
        img = new Image();
    
    img.onload = function(){
        imgWidth = img.width;
        imgHeight = img.height;
        
        scaleX = 64/img.width;
        scaleY = 48/img.height;
        scale = (scaleX < scaleY) ? scaleX : scaleY;
        
        moveL = (64 - img.width*scale) / 2;
        moveT = (48 - img.height*scale) / 2;
        context.drawImage(img, moveL, moveT, img.width*scale, img.height*scale);
        
        pixelToScreen();
        getArdunioCode();
    }
    img.src = filePath;
}

var createMapper = function() {
    
    var padding = 10;
    
    for (var i = 0; i < 48; i++) {
        //Y
        for (var j = 0; j < 64; j++) { // X
            $('<div/>', {
                id: 'c'+i+'_'+j,
                style: 'top:'+ i * padding +'px; left: '+ j * padding + 'px;',
                class: 'cell'
            }).appendTo('#mapper');
            
        }
    }
    
} // Create Mapper

var getArdunioCode = function() {
    //console.log(byteArray);
    //console.log(imageDataArray);
    //codeToString();
    
    var tempHex = '',
        tempString = 'const unsigned char logo [] = { \r\n';
    
    for(var i = 0; i < imageDataArray.length; i++) {
        tempHex = parseInt(imageDataArray[i], 2).toString(16).toUpperCase();
        //tempHex = imageDataArray[i][j];
        tempHex = (tempHex.length > 1) ? '0x'+tempHex : '0x0'+tempHex;

        tempString += (i%16 === 0 && i !== 0) ? '\r\n' : '';
        tempString += tempHex + ', ';
    }
    
    tempString = tempString.substr(0, tempString.length-2) + ' \r\n};';
    $('#outputText').html(tempString);
}

var codeToString = function() {

    $('#codedImage').html('');
    
    for(var i = 0; i < imageDataArray.length; i++) {
        $('<div/>', {
            id: 'cc'+i,
            html: imageDataArray[i],
            class: 'codedCell'
        }).appendTo('#codedImage');
        
    }
}

var pixelToScreen = function() {
    
    var imgData  = context.getImageData(0, 0, 64, 48),
        myX = 0,
        myY = 0,
        myR = 0,
        myG = 0,
        myB = 0,
        myA = 0,
        avg = 0,
        byteArray = [];
    
    for (var i = 0, n = imgData.data.length; i < n; i += 4) {
        
        myR = imgData.data[i];
        myG = imgData.data[i+1];
        myB = imgData.data[i+2];
        //myA = imgData.data[i+3];
        
        avg = (myR + myG + myB) / 3;
        
        if (avg > 127) {
            avg = 255;
        } else {
            avg = 0;
        }
        
        //$('#c' + myY + '_' + myX).css({'background-color': 'rgba('+myR+', '+myG+', '+myB+', '+myA+')'});
        //$('#c' + myY + '_' + myX).css({'background-color': 'rgb('+myR+', '+myG+', '+myB+')'});
        $('#c' + myY + '_' + myX).css({'background-color': 'rgb('+avg+', '+avg+', '+avg+')'});
        
        /* ============================================================================ */
        
        if (myX % 64 === 0 && myY % 8 === 0 && myY !== 0) {
            //console.log(myY);
            
            for(var d = 0; d < byteArray.length; d++) {
                imageDataArray.push(reverseString(byteArray[d]));
            }
            
            byteArray = [];
        }
        
        if(typeof(byteArray[myX]) != 'string') {
            //console.log('fire')
            byteArray[myX] = '';
        }

        byteArray[myX] += (avg === 255) ? '0' : '1';
        
        /* ============================================================================ */
        
        myX++;
        if (myX%64 === 0) {
            myX = 0;
            myY++;
        }
        
    }
    
    // FOR THE LAST ARRAY TO BE IN
    for(var d = 0; d < byteArray.length; d++) {
        imageDataArray.push(reverseString(byteArray[d]));
    }

}

var reverseString = function(s){
    return s.split("").reverse().join("");
}
