console.log("app.js loaded");

const galleryArray = [];
let tweens = [];

const photoContainerSelector = "#photoContainer";
const photosPerRow = 7;
const visiblePerRow = 5;

let pWidth = window.innerWidth / visiblePerRow;
let pHeight = pWidth;

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function seedGalleryArrayPicsum(size_n) {
    for(let i = 0; i < size_n; i++)
        galleryArray.push("https://picsum.photos/1920/1080?a=" + i);
}

function seedGalleryArray(size_n) {
    for(let i = 0; i < size_n; i++)
        galleryArray.push("gallery/" + i + ".webp");
}

function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
}

function toFixedTrunc(x, n) {
    x = toFixed(x) 

    // From here on the code is the same than the original answer
    const v = (typeof x === 'string' ? x : x.toString()).split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0,n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
}

function closeFullscreenPhoto() {
    let fs = document.getElementById("fullscreenPhoto");
    fs.classList.remove("open");
    fs.classList.add("closed");
}

function createPhotoBoxes() {
    let minRowCount = toFixedTrunc((window.innerHeight / pHeight)+0.99, 0);
    let currentRowCount = 0;
    let minAmount = minRowCount * photosPerRow;
    let currentAmount = 0;

    let photoContainer = document.querySelector(photoContainerSelector);
    if(photoContainer){
        let i = 0;
        let currentRow;
        while(currentAmount < minAmount) {
            let pX = (i % photosPerRow) * pWidth;
            let pY = toFixedTrunc(i / photosPerRow, 0) * pHeight;

            if(pX === 0 || !currentRow) {
                if(currentRow) {
                    photoContainer.appendChild(currentRow);
                    currentRowCount++;
                }
                currentRow = document.createElement("div");
                currentRow.classList.add("photoRow");
                currentRow.id = "_photoRow-" + currentRowCount;
                currentRow.style.height = pHeight;
                currentRow.onmouseenter = (e) => {
                    gsap.to(tweens[Number(e.target.id.split("-")[1])], {
                        duration: 2,
                        timeScale: 0.2,
                        ease: "power3"
                    });
                }
                currentRow.onmouseleave = (e) => {
                    gsap.to(tweens[Number(e.target.id.split("-")[1])], {
                        duration: 1,
                        timeScale: 1,
                        ease: "power2"
                    });
                }
            }
            
            let photoBox = document.createElement("div");
            photoBox.classList.add("photoBox");
            photoBox.style.width = pWidth;
            photoBox.style.height = pHeight;
            photoBox.style.backgroundImage = "url('" + galleryArray[i % galleryArray.length] + "')";
            //photoBox.innerHTML = i;
            photoBox.onclick = (e) => {
                let fs = document.getElementById("fullscreenPhoto");
                if(fs.classList.contains("closed")){
                    fs.classList.remove("closed");
                    fs.style.backgroundImage = e.target.style.backgroundImage;
                    fs.classList.add("open");
                }
            }
            photoBox.onmouseenter = (e) => {
                document.querySelectorAll(".photoBox").forEach((pB) => {
                    if(pB === e.target) {
                        gsap.to(e.target, {
                            duration: 0.3,
                            scale: 1.5,
                            ease: "power3"
                        });
                    } else {
                        gsap.to(pB, {
                            ease: "back",
                            duration: 0.2,
                            scale: 1
                        });
                    }
                })
                // gsap.to(e.target, {
                //     duration: 0.3,
                //     scale: 1.5
                // });
            };
            // photoBox.onmouseleave = (e) => {
            //     gsap.to(e.target, {
            //         ease: "back",
            //         duration: 0.2,
            //         scale: 1
            //     });
            // };
            currentRow.appendChild(photoBox);
            currentAmount++;
            i++;
        }
        if(currentRow) photoContainer.appendChild(currentRow);
    }
}

function _animateRows() {
    let rows = document.querySelectorAll(".photoRow");
    rows.forEach((row, index) => {
        let dur = Math.random() * 10 + 10;
        gsap.to("#_photoRow-" + index + " .photoBox", {
            duration: dur,
            ease: "none",
            x: ( Math.random() < 0.5 ? "+" : "-" ) + "=" + (window.innerWidth + pWidth),
            modifiers: {
              x: gsap.utils.unitize(x => ((parseFloat(x) % (window.innerWidth + pWidth)) - pWidth)) //force x value to be between 0 and 500 using modulus
            },
            repeat: -1
          });
    });
}

function animateRows() {
    let rows = document.querySelectorAll(".photoRow");
    rows.forEach((row, index) => {
        gsap.set("#_photoRow-"+index+" .photoBox", {
            x: i => (i % photosPerRow) * pWidth,
            y: 0//pHeight * index
        });
        if(Math.random() < 0.5){
            // right
            tweens[index] = gsap.to("#_photoRow-"+index+" .photoBox", {
                duration: Math.random() * 20 + 30,
                ease: "none",
                x: "+=" + (window.innerWidth + pWidth * ( photosPerRow - visiblePerRow )),
                modifiers: {
                    x: gsap.utils.unitize(xStr => {
                        let x = parseFloat(xStr);
                        let d = pWidth * ( photosPerRow - visiblePerRow );
                        return (x % (window.innerWidth + d)) - d;
                    })
                },
                repeat: -1
            });
        } else {
            // left
            tweens[index] = gsap.to("#_photoRow-"+index+" .photoBox", {
                duration: Math.random() * 20 + 30,
                ease: "none",
                x: "-=" + (window.innerWidth + pWidth * ( photosPerRow - visiblePerRow )),
                modifiers: {
                    x: gsap.utils.unitize(xStr => {
                        let x = parseFloat(xStr);
                        let d = pWidth * ( photosPerRow - visiblePerRow );
                        return (x <= (0 - pWidth)) ? x + window.innerWidth + d : x;
                    })
                },
                repeat: -1
            });
        }
    });
}

seedGalleryArray(9);
shuffle(galleryArray);
createPhotoBoxes();
animateRows();