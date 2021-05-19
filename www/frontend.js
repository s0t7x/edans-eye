class GalleryPhoto {
    constructor(URL, Description) {
        this.url = URL;
        this.description = Description;
    }
}

// let galleryArray = [
//     new GalleryPhoto("https://i.postimg.cc/nLsw87vN/2019-08-24-64939657.png", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet,"),
//     new GalleryPhoto("https://i.postimg.cc/d1rH3YNB/2019-08-24-71867775.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/XNK10nCN/2020-06-11-27505435.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/8zYtb5q4/2021-05-03-46499576.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/C5wNKfqh/2021-05-09-55872444.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/LXKDrW4Z/2021-05-09-74510079.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/HsZ2pnsm/2021-05-11-13578048.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/05ZGfjSS/2021-05-11-13661008.png", "test das ist ja absoluter wahnsinn *-*"),
//     new GalleryPhoto("https://i.postimg.cc/FznLQfbn/2021-05-11-20028924.png", "test das ist ja absoluter wahnsinn *-*"),
// ];

let galleryArray = [];

let tweens = [];
let photoDescriptionTween = gsap.to("#photoDescription", {
    opacity: 0.8,
    duration: 3,
    ease: "power1"
});;

const photoContainerSelector = "#photoContainer";

const urlParams = new URLSearchParams(window.location.search);
const paramPhotosPerRow = urlParams.get("photosPerRow");
const paramVisiblePerRow = urlParams.get("visiblePerRow");

const photosPerRow = paramPhotosPerRow ? paramPhotosPerRow : 8;
const visiblePerRow = paramVisiblePerRow ? paramVisiblePerRow : 6;

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
        galleryArray.push(new GalleryPhoto("https://picsum.photos/1920/1080?a=" + i, "A Lorem Ipsum Photo provided by Picsum.Photos"));
}

function seedGalleryArray(size_n) {
    for(let i = 0; i < size_n; i++)
        galleryArray.push(new GalleryPhoto("gallery/" + i + ".webp", ""));
}

async function seedGalleryArrayDB() {
    let galleryArrayFetchResult = await fetch("/fetch");
    galleryArray = await galleryArrayFetchResult.json();
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
            photoBox.style.backgroundImage = "url('" + galleryArray[i % galleryArray.length].url + "')";
            photoBox.dataset.description = galleryArray[i % galleryArray.length].description;
            photoBox.style.opacity = 0.7;
            //photoBox.innerHTML = i;
            photoBox.onclick = (e) => {
                let fs = document.getElementById("fullscreenPhoto");
                if(fs.classList.contains("closed")){
                    fs.classList.remove("closed");
                    fs.style.backgroundImage = e.target.style.backgroundImage;
                    fs.querySelector("#photoDescription").innerText = e.target.dataset.description
                    photoDescriptionTween.pause();
                    photoDescriptionTween.progress(0);
                    fs.classList.add("open");
                    photoDescriptionTween.play();
                }
            }
            photoBox.onmouseenter = (e) => {
                document.querySelectorAll(".photoBox").forEach((pB) => {
                    if(pB === e.target) {
                        gsap.to(e.target, {
                            duration: 0.3,
                            scale: 1.5,
                            opacity: 1,
                            ease: "power3"
                        });
                    } else {
                        gsap.to(pB, {
                            ease: "back",
                            duration: 0.2,
                            scale: 1,
                            opacity: 0.7
                        });
                    }
                })
                // gsap.to(e.target, {
                //     duration: 0.3,
                //     scale: 1.5
                // });
            };
            photoBox.onmouseleave = (e) => {
                gsap.to(e.target, {
                    ease: "back",
                    duration: 0.2,
                    scale: 1,
                    opacity: 0.7
                });
            };
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
            y: 0
        });
        if(Math.random() < 0.5){
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

seedGalleryArrayDB().then(() => {
    shuffle(galleryArray);
    createPhotoBoxes();
    animateRows();
    console.log("app.js loaded");
});