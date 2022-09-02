import { songs } from "./data.js"

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "config";

const heading = $(".heading > h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cdEle = $(".cd");
const playlist = $(".playlist");
const panel = $(".panel");
const framePlaylist = $(".frame-playlist");
const player = $(".player");
const progress = $(".progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

var cdThumbAnimate = cdThumb.animate(
   {
      transform: 'rotate(360deg)'
   },
   {
      duration: 10000,
      iterations: Infinity,
   }
);

const app = {
   currentIndex: 0,
   isRandom: false,
   isPlaying: false,
   isRepeat: false,
   songs: songs,
   config: JSON.parse(localStorage.getItem("configStorage")) || {},
   setConfig: function(key,value){
      this.config[key] = value;
      localStorage.setItem("configStorage",JSON.stringify(this.config));
   }, 
   loadConfig: function(){
      this.isRandom = this.config.isRandom;
      if(this.isRandom)
         randomBtn.classList.add("active");
      this.isRepeat = this.config.isRepeat;
      if(this.isRepeat)
      repeatBtn.classList.add("active"); 
   },
   render: function () {
      const htmls = this.songs.map((song,index) => {
         return `
                  <div class="song" data-index="${index}">
                     <div class="thumb" style="background-image: url('${song.image}')">
                     </div>
                     <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                     </div>
                     <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                     </div>
                  </div>
               `
      });
      playlist.innerHTML = htmls.join("");
   },
   scrollToActiveSong: function(){
      setTimeout(()=>{
         $(".song.active").scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
         });
      },500);
   },
   defineProperties: function () {
      Object.defineProperty(this,"currentSong",{
         get: function () {
            return this.songs[this.currentIndex];
         }
      })
   },
   loadCurrentSong: function () {
      heading.innerHTML = this.currentSong.name;
      cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
      audio.src = this.currentSong.path;

      var songIsActiving = $(".song.active");
      if(songIsActiving)
         songIsActiving.classList.remove("active");
      var currentSongEle = $(`[data-index="${this.currentIndex}"]`);
      currentSongEle.classList.toggle("active");
   },
   nextSong: function () {
      this.currentIndex == (this.songs.length - 1) ? this.currentIndex = 0 : ++this.currentIndex;
      this.loadCurrentSong();
   },
   prevSong: function () {
      this.currentIndex == 0 ? this.currentIndex = (this.songs.length - 1) : --this.currentIndex;

      this.loadCurrentSong();
   },
   randomSong: function(){
      var flagIndex = this.currentIndex;
      do{
         this.currentIndex = Math.floor(Math.random() * this.songs.length);
      }while(this.currentIndex == flagIndex);
      this.loadCurrentSong();
   },
   handleEvent: function () {
      cdThumbAnimate.pause();

      randomBtn.onclick = function(event){
         this.classList.toggle("active");
         if(_this.isRandom){
            _this.isRandom = false;
            _this.setConfig("isRandom",_this.isRandom);
         }
         else{
            _this.isRandom = true;
            _this.setConfig("isRandom",_this.isRandom);
         }
      }

      // next and prev song.
      nextBtn.onclick = function () {
         if(_this.isRandom){
            _this.randomSong();
         }
         else if(!_this.isRepeat){
            _this.nextSong();
         }
         else{
            _this.loadCurrentSong();
         }

         audio.play();
         player.classList.add("playing");
         _this.isPlaying = true;
         cdThumbAnimate.play();
         _this.scrollToActiveSong();
      }

      prevBtn.onclick = function(){
         if(_this.isRandom){
            _this.randomSong();
         }
         else if(!_this.isRepeat){
            _this.prevSong();
         }
         else{
            _this.loadCurrentSong();
         }
         audio.play();
         player.classList.add("playing");
         _this.isPlaying = true;
         cdThumbAnimate.play();
         _this.scrollToActiveSong();
      }

      var _this = this; /*cách nay hơi cũ */
      // handle drag and drop 
      var oriYPlaylist = null;
      var oriCdWidth = null;
      var framePlaylistHeight = null;
      let varRange = null;

      function resize(event) {
         if (event.y)
            varRange = oriYPlaylist - event.y;
         else
            varRange = oriYPlaylist - event.touches[0].clientY;

         if ((framePlaylistHeight + varRange) <= 488 && (framePlaylistHeight + varRange) >= 288) {
            framePlaylist.style.height = (framePlaylistHeight + varRange) + "px";

            cdEle.style.width = (oriCdWidth - varRange) > 0 ? (oriCdWidth - varRange) + "px" : 0;

            cdEle.style.opacity = cdEle.offsetWidth / oriCdWidth;

            // const dy = oriYPlaylist - event.y;
            // oriYPlaylist = event.y;
            // framePlaylist.style.height = (parseInt(getComputedStyle(framePlaylist, '').height) + dy) + "px";
         }
      }

      panel.addEventListener("mousedown",function (event) {
         oriCdWidth = cdEle.offsetWidth;
         oriYPlaylist = event.y;
         framePlaylistHeight = framePlaylist.offsetHeight;
         document.addEventListener("mousemove",resize);
      });
      panel.addEventListener("touchstart",function (event) {
         oriCdWidth = cdEle.offsetWidth;
         oriYPlaylist = event.touches[0].clientY;
         framePlaylistHeight = framePlaylist.offsetHeight;
         document.addEventListener("touchmove",resize);
      });
      document.addEventListener("touchEnd",function () {
         document.removeEventListener("touchmove",resize);
      });
      document.addEventListener("mouseup",function () {
         document.removeEventListener("mousemove",resize);
      });

      // Handle click play btn
      var playBtn = $(".btn.btn-toggle-play");
      playBtn.addEventListener("click",function () {
         player.classList.toggle("playing");
         if (_this.isPlaying) {
            audio.pause();
            _this.isPlaying = false;
            cdThumbAnimate.pause();
         } else {
            audio.play();
            _this.isPlaying = true;
            cdThumbAnimate.play();
         }
      })

      // create motion for progress bar
      audio.ontimeupdate = function () {
         const progressPercent = (audio.currentTime / audio.duration) * 100;
         progress.value = progressPercent;
      }

      // seek 
      progress.onchange = function (e) {
         const seekTime = (progress.value / 100) * audio.duration;
         audio.currentTime = seekTime;
      }
      //next song when audio ended.
      audio.onended = function(event){
         nextBtn.click();
      }
      
      //when btn repeat is clicked
      repeatBtn.onclick = function(event){
         this.classList.toggle("active");
         if(_this.isRepeat){
            _this.isRepeat = false;
            _this.setConfig("isRepeat",_this.isRepeat);
         }else{
            _this.isRepeat = true;
            _this.setConfig("isRepeat",_this.isRepeat);
         }
      }

      //When songElement is clicked

      playList.onclick = function(event){
         var songNode = event.target.closest(".song:not(.active)");

         if(songNode || event.target.closest(".option")){
            // click vao node song.
               if(songNode){
                  _this.currentIndex = Number(songNode.getAttribute("data-index"));
                  _this.loadCurrentSong();
                  audio.play();
               }
            //click vao  option icon.
               if(event.target.closest(".option")){

               }
         }
      }
   },
   start: function () {
      this.loadConfig();
      this.defineProperties();
      this.handleEvent();
      this.render();
      this.loadCurrentSong();
   }
}
app.start();

