document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos DOM ---
    const musicPageLayout = document.getElementById('music-page-layout'); 
    const chapterSelectionSection = document.getElementById('chapter-selection-section');
    const chapterButtons = document.querySelectorAll('.chapter-button');
    const chapterTitleDisplay = document.getElementById('chapter-title-display');
    const songListElement = document.getElementById('song-list');
    const backToChaptersButton = document.getElementById('back-to-chapters');
    
    const playerPanel = document.getElementById('player-panel'); 
    const songTitleElement = document.getElementById('song-title');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeElement = document.getElementById('current-time');
    const durationElement = document.getElementById('duration');
    const artistPhotoElement = document.getElementById('artist-photo');
    const artistNameElement = document.getElementById('artist-name');
    const toggleDetailsButton = document.getElementById('toggle-details-button');
    const detailedCreditsElement = document.getElementById('detailed-credits');
    const placeholderArtistImage = 'img/artistas/placeholder-artist.png';
    const volumeIconButton = document.getElementById('volume-icon-button');
    const volumeSlider = document.getElementById('volume-slider');
    const closePlayerButton = document.getElementById('close-player-button');

    // --- Estado do Player ---
    let songs = [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let currentChapter = null;
    let currentJsonPath = '';
    let lastVolume = 1;
    let isPlayerActive = false; 

    // === GERENCIAMENTO DE TELAS E LAYOUT DO PLAYER ===
    function switchScreen(screenToShow, screenToHide) {
        if (screenToHide) {
            screenToHide.classList.remove('visible');
        }
        if (screenToShow) {
            void screenToShow.offsetWidth; 
            screenToShow.classList.add('visible');
        }
    }

    function openPlayerLayout() {
        if (!isPlayerActive) {
            musicPageLayout.classList.add('player-active');
            isPlayerActive = true;
        }
    }

    function closePlayerLayout() {
        if (isPlayerActive) {
            musicPageLayout.classList.remove('player-active');
            isPlayerActive = false;
            pauseSong();
            updatePlayerUI(null); 
            songListElement.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
            currentSongIndex = -1; 
        }
    }
    
    closePlayerButton.addEventListener('click', closePlayerLayout);

    // === INICIALIZAÇÃO E SELEÇÃO DE CAPÍTULO ===
    function showChapterSelectionScreen() {
        switchScreen(chapterSelectionSection, musicPageLayout);
        closePlayerLayout(); 
        document.title = "Player de Música Pixel - Seleção";
        resetPlayerState(); 
    }

    function showMusicLayoutScreen(chapterNumber, chapterJsonPath) {
        currentChapter = chapterNumber;
        currentJsonPath = chapterJsonPath;
        chapterTitleDisplay.textContent = `Chapter ${currentChapter}`;
        switchScreen(musicPageLayout, chapterSelectionSection);
        closePlayerLayout(); 
        document.title = `Pixel Tunes - Chapter ${currentChapter}`;
        loadSongsAndSetup(currentJsonPath);
    }

    chapterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chapterNumber = button.dataset.chapter;
            const jsonPath = `data/chapter${chapterNumber}.json`;
            showMusicLayoutScreen(chapterNumber, jsonPath);
        });
    });
    backToChaptersButton.addEventListener('click', showChapterSelectionScreen);

    // === CARREGAMENTO E LISTAGEM DE MÚSICAS ===
    async function loadSongsAndSetup(jsonPath) {
        try {
            songListElement.innerHTML = '<li class="loading-placeholder">Carregando músicas...</li>';
            resetPlayerUIForNewChapter();
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} para ${jsonPath}`);
            songs = await response.json();
            populateSongList();
            if (songs.length === 0) {
                 songListElement.innerHTML = '<li>Nenhuma música encontrada neste capítulo.</li>';
            }
            updatePlayerUI(null);
        } catch (error) {
            console.error("Erro ao carregar as músicas:", error);
            songListElement.innerHTML = `<li>Erro ao carregar: ${error.message}</li>`;
            updatePlayerUI(null);
        }
    }

    function populateSongList() {
        songListElement.innerHTML = ''; 
        if (songs.length > 0) {
            songs.forEach((song, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = song.nome;
                listItem.dataset.index = index;
                listItem.addEventListener('click', () => handleSongSelection(index));
                songListElement.appendChild(listItem);
            });
        }
    }
    
    function handleSongSelection(index) {
        openPlayerLayout(); 

        songListElement.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
        const newActiveItem = songListElement.querySelector(`li[data-index="${index}"]`);
        if (newActiveItem) newActiveItem.classList.add('active');

        if (currentSongIndex !== index || !isPlaying) { 
            currentSongIndex = index;
            loadSong(currentSongIndex); 
            playSong(); 
        }
    }

    // === CONTROLE DO PLAYER E ATUALIZAÇÃO DA UI ===
    function loadSong(songIndex) {
        if (songIndex < 0 || songIndex >= songs.length) return;
        const song = songs[songIndex];
        audioPlayer.src = song.arquivo;
        updatePlayerUI(song);
        detailedCreditsElement.classList.remove('visible');
        toggleDetailsButton.setAttribute('aria-expanded', 'false');
    }
    
    function updatePlayerUI(song) {
        if (song && song.creditos) {
            songTitleElement.textContent = song.nome || "Título Desconhecido";
            const artistDisplayName = song.creditos.artistaPrincipal.nome || "Artista";
            artistNameElement.textContent = artistDisplayName.startsWith('@') ? artistDisplayName : `@${artistDisplayName}`;
            artistPhotoElement.src = song.creditos.artistaPrincipal.foto || placeholderArtistImage;
            artistPhotoElement.alt = `Foto de ${artistDisplayName}`;
            toggleDetailsButton.style.display = song.creditos.detalhes && song.creditos.detalhes.length > 0 ? 'inline-flex' : 'none'; // inline-flex para botões de ícone
        } else {
            songTitleElement.textContent = "---";
            artistNameElement.textContent = "@Selecione";
            artistPhotoElement.src = placeholderArtistImage;
            artistPhotoElement.alt = "Foto do Artista Placeholder";
            detailedCreditsElement.innerHTML = '';
            detailedCreditsElement.classList.remove('visible');
            toggleDetailsButton.style.display = 'none';
            progressBar.style.width = '0%';
            currentTimeElement.textContent = '0:00';
            durationElement.textContent = '0:00';
        }
    }

    function playSong() {
        if (!audioPlayer.src || currentSongIndex < 0) {
            if (songs.length > 0 && currentSongIndex < 0) {
                return; 
            } else if (currentSongIndex < 0) return;
        }
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                playPauseButton.classList.add('playing'); 
                playPauseButton.setAttribute('aria-label', 'Pause');
            })
            .catch(error => {
                console.error("Erro ao tocar música:", error);
                isPlaying = false;
                playPauseButton.classList.remove('playing'); 
                playPauseButton.setAttribute('aria-label', 'Play');
            });
    }

    function pauseSong() {
        audioPlayer.pause();
        isPlaying = false;
        playPauseButton.classList.remove('playing'); 
        playPauseButton.setAttribute('aria-label', 'Play');
    }

    function togglePlayPause() {
        if (!isPlayerActive || currentSongIndex < 0) { 
             if (songs.length > 0 && !isPlayerActive) { 
                handleSongSelection(currentSongIndex >= 0 ? currentSongIndex : 0);
            }
            return;
        }
        if (isPlaying) pauseSong(); else playSong();
    }
    
    function playNextOrPrev(newIndex) {
        if (!isPlayerActive) return; 
        const wasPlaying = isPlaying;
        currentSongIndex = newIndex;
        loadSong(currentSongIndex); 
        songListElement.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
        const newActiveItem = songListElement.querySelector(`li[data-index="${currentSongIndex}"]`);
        if (newActiveItem) newActiveItem.classList.add('active');
        if (wasPlaying) playSong(); else pauseSong();
    }

    nextButton.addEventListener('click', () => {
        if (songs.length === 0 || !isPlayerActive) return;
        playNextOrPrev((currentSongIndex + 1) % songs.length);
    });
    prevButton.addEventListener('click', () => {
        if (songs.length === 0 || !isPlayerActive) return;
        playNextOrPrev((currentSongIndex - 1 + songs.length) % songs.length);
    });

    // === BARRA DE PROGRESSO ===
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    audioPlayer.addEventListener('loadedmetadata', () => {
        if (audioPlayer.duration) durationElement.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
        currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
    });
    progressContainer.addEventListener('click', (e) => {
        if (!audioPlayer.duration || !isPlayerActive) return;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = progressContainer.clientWidth;
        audioPlayer.currentTime = (clickX / width) * audioPlayer.duration;
    });

    // === CRÉDITOS DETALHADOS ===
    toggleDetailsButton.addEventListener('click', () => {
        if (currentSongIndex < 0 || !songs[currentSongIndex].creditos || !songs[currentSongIndex].creditos.detalhes || !isPlayerActive) return;
        const isExpanded = detailedCreditsElement.classList.toggle('visible');
        toggleDetailsButton.setAttribute('aria-expanded', String(isExpanded));
        if (isExpanded) {
            detailedCreditsElement.innerHTML = '';
            const details = songs[currentSongIndex].creditos.detalhes;
            if (details && details.length > 0) {
                details.forEach(detail => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${detail.funcao}:</strong> ${detail.nome}`;
                    detailedCreditsElement.appendChild(p);
                });
            } else {
                 detailedCreditsElement.innerHTML = '<p>Sem detalhes adicionais.</p>';
            }
        }
    });

    // === CONTROLE DE VOLUME ===
    function updateVolumeDisplay() {
        const currentVolume = audioPlayer.volume;
        const isMuted = audioPlayer.muted;

        volumeIconButton.classList.remove('volume-state-high', 'volume-state-medium', 'volume-state-low', 'volume-state-mute');

        if (isMuted || currentVolume === 0) {
            volumeIconButton.classList.add('volume-state-mute');
            volumeIconButton.setAttribute('aria-label', 'Ativar som');
        } else if (currentVolume < 0.01) { 
            volumeIconButton.classList.add('volume-state-mute');
            volumeIconButton.setAttribute('aria-label', 'Ativar som');
        } else if (currentVolume < 0.5) {
            volumeIconButton.classList.add('volume-state-low');
            volumeIconButton.setAttribute('aria-label', 'Volume baixo');
        } else if (currentVolume < 0.8) { 
            volumeIconButton.classList.add('volume-state-medium');
            volumeIconButton.setAttribute('aria-label', 'Volume médio');
        }
         else { 
            volumeIconButton.classList.add('volume-state-high');
            volumeIconButton.setAttribute('aria-label', 'Volume alto');
        }
        volumeSlider.value = isMuted ? 0 : currentVolume;
    }
    volumeSlider.addEventListener('input', () => {
        if (!isPlayerActive && songs.length > 0) { 
            handleSongSelection(currentSongIndex >= 0 ? currentSongIndex : 0); 
        } else if (!isPlayerActive) return;

        audioPlayer.volume = volumeSlider.value;
        audioPlayer.muted = volumeSlider.value == 0; 
        lastVolume = audioPlayer.volume;
    });
    audioPlayer.addEventListener('volumechange', updateVolumeDisplay);
    volumeIconButton.addEventListener('click', () => {
         if (!isPlayerActive && songs.length > 0) {
            handleSongSelection(currentSongIndex >= 0 ? currentSongIndex : 0);
        } else if (!isPlayerActive) return;

        if (audioPlayer.muted) {
            audioPlayer.muted = false;
            audioPlayer.volume = lastVolume > 0.01 ? lastVolume : 0.5; 
        } else {
            if (audioPlayer.volume > 0) lastVolume = audioPlayer.volume;
            audioPlayer.muted = true;
        }
    });

    // === EVENT LISTENERS GERAIS ===
    playPauseButton.addEventListener('click', togglePlayPause);
    audioPlayer.addEventListener('ended', () => {
        if (songs.length === 0 || !isPlayerActive) return;
        playNextOrPrev((currentSongIndex + 1) % songs.length);
    });

    // === FUNÇÕES DE RESET ===
    function resetPlayerUIForNewChapter() {
        updatePlayerUI(null);
        playPauseButton.classList.remove('playing');
        playPauseButton.setAttribute('aria-label', 'Play');
        isPlaying = false;
        songListElement.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
    }
    function resetPlayerState() {
        audioPlayer.pause();
        audioPlayer.src = '';
        resetPlayerUIForNewChapter();
        currentSongIndex = -1; 
        songs = [];
        currentChapter = null;
        currentJsonPath = '';
    }

    // --- INICIALIZAÇÃO ---
    showChapterSelectionScreen(); 
    updateVolumeDisplay();
    playPauseButton.classList.remove('playing'); 
    playPauseButton.setAttribute('aria-label', 'Play');
    toggleDetailsButton.setAttribute('aria-expanded', 'false');
});