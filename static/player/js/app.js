
(function() {
    // --- 工具函数 ---
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    /**
     * 解析 LRC 歌词文本
     * 修复：根据毫秒位数正确计算偏移量
     *   - 1位数字 (如 .5)  → 十分之一秒
     *   - 2位数字 (如 .50) → 百分之一秒
     *   - 3位数字 (如 .500)→ 千分之一秒（真毫秒）
     */
    const parseLrc = (text) => {
        if (!text || typeof text !== 'string') return [];
        const lines = text.split('\n');
        const regex = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\](.*)/;
        const result = [];

        lines.forEach(line => {
            const match = regex.exec(line);
            if (match) {
                const min = parseInt(match[1], 10);
                const sec = parseInt(match[2], 10);
                const msStr = match[3] || '0';
                const msVal = parseInt(msStr, 10);
                // 根据位数决定除数
                const divisor = Math.pow(10, msStr.length);
                const fractionalSeconds = msVal / divisor;
                const time = min * 60 + sec + fractionalSeconds;
                const content = match[4].trim();
                if (content) result.push({ time, content });
            }
        });
        // 按时间排序
        result.sort((a, b) => a.time - b.time);
        return result;
    };

    /**
     * 从 ID3 标签中提取艺术家信息
     * 尝试多个可能的字段，兼容 jsmediatags 返回的对象格式
     */
    const extractArtist = (tags) => {
        const artistFields = [
            tags.artist,
            tags.artists,
            tags.performer,
            tags.performers,
            tags.TPE1,
            tags.TPE2,
            tags.composer,
            tags.albumartist,
            tags['TPE1'],
            tags['TPE2'],
        ];

        for (const field of artistFields) {
            if (!field) continue;
            if (typeof field === 'string' && field.trim()) return field.trim();
            if (typeof field === 'object' && field.data) {
                const str = String(field.data).trim();
                if (str) return str;
            }
            // 处理数组类型的 artists
            if (Array.isArray(field) && field.length > 0) {
                const first = field[0];
                if (typeof first === 'string' && first.trim()) return first.trim();
            }
        }
        return "未知艺术家";
    };

    /**
     * 从 ID3 标签中提取标题
     */
    const extractTitle = (tags, fileName) => {
        const titleFields = [
            tags.title,
            tags.TIT2,
            tags['TIT2'],
        ];

        for (const field of titleFields) {
            if (!field) continue;
            if (typeof field === 'string' && field.trim()) return field.trim();
            if (typeof field === 'object' && field.data) {
                const str = String(field.data).trim();
                if (str) return str;
            }
        }
        return fileName.replace(/\.[^/.]+$/, "");
    };

    /**
     * 生成唯一 ID
     */
    let uidCounter = 0;
    const generateUid = () => `track_${Date.now()}_${++uidCounter}`;

    // --- 状态管理 ---
    const store = {
        playlist: [],
        currentIndex: -1,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.7,
        shuffle: false,
        repeatMode: 0, // 0 = 列表循环, 1 = 单曲循环
        searchQuery: '',
        lyrics: [],
        activeLyricIndex: -1,
        audio: new Audio(),
        isLoading: false,
        fileCount: 0,
        toastMessage: '',
        toastTimer: null,

        init() {
            this.audio.addEventListener('timeupdate', () => {
                this.currentTime = this.audio.currentTime;
                this.updateLyrics();
                m.redraw();
            });
            this.audio.addEventListener('loadedmetadata', () => {
                this.duration = this.audio.duration;
                m.redraw();
            });
            this.audio.addEventListener('ended', () => this.next());
            this.audio.addEventListener('play', () => { this.isPlaying = true;
                m.redraw(); });
            this.audio.addEventListener('pause', () => { this.isPlaying = false;
                m.redraw(); });
            this.audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                this.showToast('音频加载失败，请尝试其他文件');
                this.isPlaying = false;
                m.redraw();
            });
            this.audio.volume = this.volume;
        },

        showToast(msg) {
            this.toastMessage = msg;
            if (this.toastTimer) clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                this.toastMessage = '';
                this.toastTimer = null;
                m.redraw();
            }, 2300);
            m.redraw();
        },

        async loadFiles(files) {
            // 清理旧资源
            this.cleanupOldUrls();
            this.isLoading = true;
            this.toastMessage = '';
            m.redraw();

            const fileList = Array.from(files);
            console.log('Total files selected:', fileList.length);

            const audioExtensions = /\.(mp3|wav|ogg|flac|m4a|aac|wma|opus|webm)$/i;
            const lrcExtension = /\.lrc$/i;

            const audioFiles = [];
            const lrcFiles = new Map();

            // 分类文件
            fileList.forEach(file => {
                if (audioExtensions.test(file.name)) {
                    audioFiles.push(file);
                } else if (lrcExtension.test(file.name)) {
                    const baseName = file.name.replace(/\.lrc$/i, '');
                    lrcFiles.set(baseName, file);
                }
            });

            console.log('Audio files found:', audioFiles.length, 'LRC files found:', lrcFiles.size);
            this.fileCount = audioFiles.length;

            if (audioFiles.length === 0) {
                this.showToast('未找到音频文件，请选择包含 mp3/wav/ogg/flac 等格式的文件夹');
                this.isLoading = false;
                m.redraw();
                return;
            }

            // 创建 track 对象
            const newTracks = audioFiles.map(file => {
                const baseName = file.name.replace(/\.[^/.]+$/, "");
                const lrcFile = lrcFiles.get(baseName);

                return {
                    uid: generateUid(),
                    file: file,
                    name: file.name,
                    artist: "未知艺术家",
                    title: baseName,
                    cover: null,
                    lrcData: null,
                    lrcFile: lrcFile,
                    url: URL.createObjectURL(file),
                };
            });

            this.playlist = newTracks;
            this.currentIndex = 0;
            this.lyrics = [];
            this.activeLyricIndex = -1;

            // 异步加载元数据
            newTracks.forEach((track) => {
                // 读取 ID3 标签
                if (window.jsmediatags && track.file.size > 0) {
                    try {
                        jsmediatags.read(track.file, {
                            onSuccess: (tag) => {
                                const tags = tag.tags;
                                track.title = extractTitle(tags, track.file.name);
                                track.artist = extractArtist(tags);

                                if (tags.picture) {
                                    const { data, format } = tags.picture;
                                    let base64String = "";
                                    for (let i = 0; i < data.length; i++) {
                                        base64String += String.fromCharCode(data[i]);
                                    }
                                    track.cover = `data:${format};base64,${window.btoa(base64String)}`;
                                }
                                m.redraw();
                            },
                            onError: (error) => {
                                console.log('ID3 read error for', track.name, error);
                            },
                        });
                    } catch (e) {
                        console.log('jsmediatags exception for', track.name, e);
                    }
                }

                // 读取 LRC 文件
                if (track.lrcFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        track.lrcData = parseLrc(e.target.result);
                        // 如果当前正在播放该曲目，更新歌词
                        if (store.currentIndex === newTracks.indexOf(track)) {
                            store.lyrics = track.lrcData || [];
                            store.activeLyricIndex = -1;
                        }
                        m.redraw();
                    };
                    reader.onerror = () => {
                        console.log('LRC read error for', track.lrcFile.name);
                    };
                    reader.readAsText(track.lrcFile);
                }
            });

            // 加载第一首曲目
            if (this.playlist.length > 0) {
                this.loadTrack(0);
            }

            this.isLoading = false;
            m.redraw();
        },

        cleanupOldUrls() {
            this.playlist.forEach(track => {
                if (track.url && track.url.startsWith('blob:')) {
                    try {
                        URL.revokeObjectURL(track.url);
                    } catch (e) { /* 忽略 */ }
                }
            });
        },

        loadTrack(index) {
            if (index < 0 || index >= this.playlist.length) return;

            const wasPlaying = this.isPlaying;
            this.currentIndex = index;
            const track = this.playlist[index];

            // 暂停当前播放
            this.audio.pause();
            this.audio.src = track.url;
            this.audio.load();
            this.lyrics = track.lrcData || [];
            this.activeLyricIndex = -1;
            this.currentTime = 0;
            this.duration = 0;

            // 恢复播放
            const playPromise = this.audio.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(e => {
                    console.log('Autoplay prevented:', e.message);
                    this.isPlaying = false;
                    m.redraw();
                });
            }
            m.redraw();
        },

        play() {
            if (this.playlist.length === 0) return;
            const promise = this.audio.play();
            if (promise && promise.catch) {
                promise.catch(e => {
                    console.log('Play prevented:', e.message);
                    this.isPlaying = false;
                    m.redraw();
                });
            }
        },

        pause() {
            this.audio.pause();
        },

        togglePlay() {
            if (this.playlist.length === 0) return;
            if (this.isPlaying) this.pause();
            else this.play();
        },

        next() {
            if (this.playlist.length === 0) return;

            // 单曲循环
            if (this.repeatMode === 1) {
                this.audio.currentTime = 0;
                this.play();
                m.redraw();
                return;
            }

            let nextIndex;
            if (this.shuffle && this.playlist.length > 1) {
                // 随机选择，避免连续重复同一首
                do {
                    nextIndex = Math.floor(Math.random() * this.playlist.length);
                } while (nextIndex === this.currentIndex && this.playlist.length > 1);
            } else {
                nextIndex = this.currentIndex + 1;
                if (nextIndex >= this.playlist.length) nextIndex = 0;
            }
            this.loadTrack(nextIndex);
            m.redraw();
        },

        prev() {
            if (this.playlist.length === 0) return;
            // 如果播放超过3秒，回到开头
            if (this.audio.currentTime > 3) {
                this.audio.currentTime = 0;
                m.redraw();
                return;
            }
            let prevIndex = this.currentIndex - 1;
            if (prevIndex < 0) prevIndex = this.playlist.length - 1;
            this.loadTrack(prevIndex);
            m.redraw();
        },

        seek(time) {
            const clamped = Math.max(0, Math.min(time, this.duration || 0));
            this.audio.currentTime = clamped;
            this.currentTime = clamped;
            m.redraw();
        },

        setVolume(val) {
            this.volume = Math.max(0, Math.min(1, val));
            this.audio.volume = this.volume;
        },

        deleteTrack(index, e) {
            if (e) e.stopPropagation();
            if (index < 0 || index >= this.playlist.length) return;

            const wasPlayingCurrent = (index === this.currentIndex);
            const trackToDelete = this.playlist[index];

            // 释放 blob URL
            if (trackToDelete.url && trackToDelete.url.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(trackToDelete.url);
                } catch (e) { /* 忽略 */ }
            }

            // 从播放列表移除
            this.playlist.splice(index, 1);
            this.fileCount = this.playlist.length;

            if (this.playlist.length === 0) {
                // 列表为空
                this.audio.pause();
                this.audio.src = "";
                this.audio.removeAttribute('src');
                this.currentIndex = -1;
                this.isPlaying = false;
                this.lyrics = [];
                this.activeLyricIndex = -1;
                this.currentTime = 0;
                this.duration = 0;
            } else if (wasPlayingCurrent) {
                // 删除的是当前播放曲目
                const newIndex = index >= this.playlist.length ? this.playlist.length - 1 : index;
                this.loadTrack(newIndex);
            } else if (index < this.currentIndex) {
                // 删除的曲目在当前曲目之前，索引需要减1
                this.currentIndex--;
            }
            // 如果删除的曲目在当前曲目之后，currentIndex 不变

            m.redraw();
        },

        clearPlaylist() {
            this.cleanupOldUrls();
            this.playlist = [];
            this.fileCount = 0;
            this.currentIndex = -1;
            this.isPlaying = false;
            this.lyrics = [];
            this.activeLyricIndex = -1;
            this.currentTime = 0;
            this.duration = 0;
            this.audio.pause();
            this.audio.src = "";
            this.audio.removeAttribute('src');
            m.redraw();
        },

        updateLyrics() {
            if (!this.lyrics || !this.lyrics.length) {
                if (this.activeLyricIndex !== -1) {
                    this.activeLyricIndex = -1;
                }
                return;
            }
            const time = this.audio.currentTime;
            let activeIndex = -1;

            for (let i = 0; i < this.lyrics.length; i++) {
                if (time >= this.lyrics[i].time) {
                    activeIndex = i;
                } else {
                    break;
                }
            }

            if (activeIndex !== this.activeLyricIndex) {
                this.activeLyricIndex = activeIndex;
                // 滚动歌词到可见区域（使用 requestAnimationFrame 避免频繁 DOM 操作）
                if (activeIndex !== -1) {
                    requestAnimationFrame(() => {
                        const container = document.querySelector('.lyrics-container');
                        if (container && container.children[activeIndex]) {
                            const el = container.children[activeIndex];
                            const containerRect = container.getBoundingClientRect();
                            const elRect = el.getBoundingClientRect();
                            const offset = elRect.top - containerRect.top - containerRect.height * 0.4;
                            container.scrollBy({ top: offset, behavior: 'smooth' });
                        }
                    });
                }
            }
        },
    };

    // 初始化 store
    store.init();

    // --- 键盘快捷键 ---
    document.addEventListener('keydown', (e) => {
        // 防止在输入框中触发快捷键
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                store.togglePlay();
                break;
            case 'arrowleft':
                e.preventDefault();
                store.audio.currentTime = Math.max(0, store.audio.currentTime - 5);
                store.currentTime = store.audio.currentTime;
                m.redraw();
                break;
            case 'arrowright':
                e.preventDefault();
                store.audio.currentTime = Math.min(store.duration || 0, store.audio.currentTime + 5);
                store.currentTime = store.audio.currentTime;
                m.redraw();
                break;
            case 'arrowup':
                e.preventDefault();
                store.setVolume(Math.min(1, store.volume + 0.05));
                m.redraw();
                break;
            case 'arrowdown':
                e.preventDefault();
                store.setVolume(Math.max(0, store.volume - 0.05));
                m.redraw();
                break;
            case 'n':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    store.next();
                }
                break;
            case 'p':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    store.prev();
                }
                break;
            case 's':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    store.shuffle = !store.shuffle;
                    m.redraw();
                }
                break;
            case 'r':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    store.repeatMode = (store.repeatMode + 1) % 2;
                    m.redraw();
                }
                break;
        }
    });

    // --- Mithril 组件 ---

    const Playlist = {
        view: () => {
            const filtered = store.playlist.filter(t =>
                t.title.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
                t.artist.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
                t.name.toLowerCase().includes(store.searchQuery.toLowerCase())
            );

            return m(".playlist-container", [
                m(".track-count",
                    store.fileCount > 0 ?
                    `共 ${store.fileCount} 首歌曲` +
                    (store.searchQuery ? ` · 匹配 ${filtered.length} 首` : "") :
                    "播放列表为空"
                ),
                store.isLoading ?
                m(".loading-state", [
                    m("i.fa-solid.fa-spinner.fa-spin", { style: "margin-right: 8px;" }),
                    "正在加载音乐文件..."
                ]) :
                filtered.length === 0 ?
                m(".empty-state",
                    store.playlist.length === 0 ?
                    [
                        m("i.fa-solid.fa-music",
                            { style: "font-size: 40px; display: block; margin-bottom: 15px; opacity: 0.4;" }),
                        m("span", "请选择包含音乐文件的文件夹"),
                    ] :
                    [
                        m("i.fa-solid.fa-search",
                            { style: "font-size: 40px; display: block; margin-bottom: 15px; opacity: 0.4;" }),
                        m("span", "未找到匹配的搜索结果"),
                    ]
                ) :
                filtered.map((track) => {
                    const originalIndex = store.playlist.indexOf(track);
                    const isActive = originalIndex === store.currentIndex;

                    return m(".track-item", {
                        key: track.uid,
                        class: isActive ? "active" : "",
                        onclick: () => {
                            if (originalIndex === store.currentIndex) {
                                store.togglePlay();
                            } else {
                                store.loadTrack(originalIndex);
                            }
                        },
                        title: `${track.title} - ${track.artist}`,
                    }, [
                        m(".track-info", [
                            m(".track-title-text", track.title),
                            m(".track-artist-text", track.artist),
                        ]),
                        m(".track-actions",
                            m("button.btn-delete", {
                                title: "从列表中移除",
                                onclick: (e) => store.deleteTrack(originalIndex, e),
                            }, m("i.fa-solid.fa-trash-can"))
                        ),
                    ]);
                }),
            ]);
        },
    };

    const Controls = {
        view: () => {
            const currentTrack = store.playlist[store.currentIndex];
            const progressPercent = store.duration > 0 ?
                (store.currentTime / store.duration) * 100 :
                0;

            return m(".controls-area", [
                // 进度条
                m(".progress-container", [
                    m("span", { style: "min-width: 35px; text-align: right;" },
                        formatTime(store.currentTime)),
                    m(".progress-bar", {
                        // 使用 currentTarget 确保获取进度条整体的矩形
                        onclick: function(e) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            store.seek(pos * (store.duration || 0));
                        },
                        title: "点击跳转 / 拖动进度",
                    },
                        m(".progress-fill", {
                            style: `width: ${Math.min(100, Math.max(0, progressPercent))}%`,
                        })
                    ),
                    m("span", { style: "min-width: 35px; text-align: left;" },
                        formatTime(store.duration)),
                ]),

                // 按钮行
                m(".buttons-row", [
                    // 模式按钮组
                    m("div", { style: "display: flex; gap: 6px;" }, [
                        m("button.btn-icon.mode-btn", {
                            class: store.shuffle ? "active" : "",
                            onclick: () => { store.shuffle = !store.shuffle;
                                m.redraw(); },
                            title: store.shuffle ? "随机播放：开" : "随机播放：关",
                        }, m("i.fa-solid.fa-shuffle")),
                        m("button.btn-icon.mode-btn", {
                            class: store.repeatMode === 1 ? "active" : "",
                            style: "position: relative;",
                            onclick: () => {
                                store.repeatMode = (store.repeatMode + 1) % 2;
                                m.redraw();
                            },
                            title: store.repeatMode === 1 ? "单曲循环：开" : "列表循环",
                        }, [
                            m("i.fa-solid.fa-repeat"),
                            store.repeatMode === 1 ?
                            m("span.repeat-badge", "1") :
                            null,
                        ]),
                    ]),

                    // 主要控制按钮
                    m(".main-controls", [
                        m("button.btn-icon", {
                            onclick: () => store.prev(),
                            title: "上一首 (P)",
                        }, m("i.fa-solid.fa-backward-step")),
                        m("button.btn-play", {
                            onclick: () => store.togglePlay(),
                            title: store.isPlaying ? "暂停 (空格)" : "播放 (空格)",
                        },
                            m("i.fa-solid", {
                                class: store.isPlaying ? "fa-pause" : "fa-play",
                            })
                        ),
                        m("button.btn-icon", {
                            onclick: () => store.next(),
                            title: "下一首 (N)",
                        }, m("i.fa-solid.fa-forward-step")),
                    ]),

                    // 音量控制
                    m(".volume-control", [
                        m("i.fa-solid.fa-volume-high", {
                            style: "font-size: 13px; color: var(--text-dim); flex-shrink: 0;",
                            onclick: () => {
                                store.setVolume(store.volume > 0 ? 0 : 0.7);
                                m.redraw();
                            },
                            title: store.volume > 0 ? "点击静音" : "点击恢复音量",
                        }),
                        m("input.volume-slider", {
                            type: "range",
                            min: 0,
                            max: 1,
                            step: 0.01,
                            value: store.volume,
                            oninput: function(e) {
                                store.setVolume(parseFloat(e.target.value));
                            },
                            title: `音量: ${Math.round(store.volume * 100)}%`,
                        }),
                    ]),
                ]),
            ]);
        },
    };

    const Visualizer = {
        view: () => {
            const track = store.playlist[store.currentIndex];

            // 默认封面 SVG
            const defaultCoverSvg = "data:image/svg+xml," + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">' +
                '<rect fill="#222" width="300" height="300"/>' +
                '<circle cx="150" cy="150" r="90" fill="#333"/>' +
                '<circle cx="150" cy="150" r="35" fill="#222"/>' +
                '<circle cx="150" cy="115" r="12" fill="#444"/>' +
                '</svg>'
            );

            return m(".right-panel", [
                track ? [
                    // 封面
                    m(".cover-art-container",
                        m("img.cover-art", {
                            src: track.cover || defaultCoverSvg,
                            class: store.isPlaying ? "playing" : "",
                            alt: "专辑封面",
                            onerror: function(e) {
                                e.target.src = defaultCoverSvg;
                            },
                        })
                    ),
                    // 曲目信息
                    m(".track-details", [
                        m(".track-title", { title: track.title }, track.title),
                        m(".track-artist", { title: track.artist }, track.artist),
                    ]),
                    // 歌词
                    m(".lyrics-container",
                        store.lyrics && store.lyrics.length > 0 ?
                        store.lyrics.map((line, idx) =>
                            m(".lyric-line", {
                                key: idx,
                                class: idx === store.activeLyricIndex ? "active" : "",
                                onclick: () => {
                                    // 点击歌词跳转到对应时间
                                    store.seek(line.time);
                                },
                                title: `点击跳转到 ${formatTime(line.time)}`,
                            }, line.content)
                        ) :
                        m(".empty-state", [
                            m("i.fa-solid.fa-align-center",
                                { style: "font-size: 32px; display: block; margin-bottom: 10px; opacity: 0.3;" }
                            ),
                            m("span", "暂无歌词"),
                            m("br"),
                            m("span", { style: "font-size: 12px; opacity: 0.5;" },
                                "将同名 .lrc 文件放入同一文件夹即可自动加载"),
                        ])
                    ),
                ] :
                // 空状态
                m(".empty-state", { style: "margin-top: 0;" }, [
                    m("i.fa-solid.fa-headphones", {
                        style: "font-size: 64px; display: block; margin-bottom: 20px; opacity: 0.3;"
                    }),
                    m("span", { style: "font-size: 18px;" }, "Mithril Music Player"),
                    m("br"),
                    m("span", { style: "font-size: 13px; opacity: 0.5;" },
                        "点击左侧「选择音乐文件夹」开始播放"),
                    m("br"),
                    m("span", { style: "font-size: 11px; opacity: 0.35; margin-top: 8px; display: inline-block;" },
                        "空格 播放/暂停 · ←→ 快进快退 · N/P 切换歌曲 · S 随机 · R 循环模式"),
                ]),
            ]);
        },
    };

    const Toast = {
        view: () => {
            if (!store.toastMessage) return null;
            return m(".toast", store.toastMessage);
        },
    };

    const App = {
        view: () => {
            return [
                m("#app", [
                    m(".left-panel", [
                        m(".header", [
                            m(".file-input-wrapper", [
                                m("button.btn", [
                                    m("i.fa-solid.fa-folder-open"),
                                    store.fileCount > 0 ?
                                    `已加载 ${store.fileCount} 首` :
                                    "选择音乐文件夹",
                                ]),
                                m("input", {
                                    type: "file",
                                    webkitdirectory: true,
                                    directory: true,
                                    multiple: true,
                                    onchange: function(e) {
                                        if (e.target.files && e.target.files.length > 0) {
                                            store.loadFiles(e.target.files);
                                        }
                                        // 重置以允许重复选择同一文件夹
                                        e.target.value = '';
                                    },
                                    title: "选择包含音乐文件的文件夹（支持 mp3/wav/ogg/flac/m4a 等）",
                                }),
                            ]),
                            store.fileCount > 0 ?
                            m("button.btn-icon", {
                                style: "margin-left: 6px; vertical-align: middle;",
                                onclick: () => {
                                    if (confirm('确定要清空整个播放列表吗？此操作不可撤销。')) {
                                        store.clearPlaylist();
                                    }
                                },
                                title: "清空播放列表",
                            }, m("i.fa-solid.fa-trash-can", { style: "color: var(--danger);" })) :
                            null,
                            m("input.search-box", {
                                type: "text",
                                placeholder: "搜索歌曲或艺术家...",
                                value: store.searchQuery,
                                oninput: function(e) {
                                    store.searchQuery = e.target.value;
                                },
                                title: "实时搜索播放列表",
                            }),
                        ]),
                        m(Playlist),
                        m(Controls),
                    ]),
                    m(Visualizer),
                ]),
                m(Toast),
            ];
        },
    };

    // 挂载应用
    m.mount(document.getElementById("app"), App);

    console.log('🎵 Mithril Music Player 已就绪');
    console.log('  快捷键: 空格=播放/暂停  ←→=快退/快进  N/P=下一首/上一首  S=随机  R=循环模式');
    console.log('  支持格式: mp3 / wav / ogg / flac / m4a / aac / wma / opus / webm');
    console.log('  歌词: 将同名 .lrc 文件放入同一文件夹即可自动加载');
})();