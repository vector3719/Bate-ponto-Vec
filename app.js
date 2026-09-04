// =====================================================
// DATABASE - IndexedDB Management
// =====================================================

class Database {
    constructor() {
        this.dbName = 'PontoControlDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Punches store
                if (!db.objectStoreNames.contains('punches')) {
                    const punchStore = db.createObjectStore('punches', { keyPath: 'id', autoIncrement: true });
                    punchStore.createIndex('date', 'date', { unique: false });
                    punchStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Notes store
                if (!db.objectStoreNames.contains('notes')) {
                    db.createObjectStore('notes', { keyPath: 'date' });
                }

                // Weekday settings store
                if (!db.objectStoreNames.contains('weekdaySettings')) {
                    db.createObjectStore('weekdaySettings', { keyPath: 'day' });
                }
            };
        });
    }

    async set(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async query(storeName, indexName, value) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// =====================================================
// UTILITIES - Helper Functions
// =====================================================

const utils = {
    formatTime: (minutes) => {
        if (minutes < 0) {
            const absMinutes = Math.abs(minutes);
            const hours = Math.floor(absMinutes / 60);
            const mins = absMinutes % 60;
            return `-${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    },

    formatDate: (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateDisplay: (date) => {
        const d = new Date(date);
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayName = days[d.getDay()];
        return `${day}/${month}/${d.getFullYear()} — ${dayName}`;
    },

    formatTimeHM: (date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    },

    formatTimeHMS: (date) => {
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${h}:${m}:${s}`;
    },

    parseTime: (timeString) => {
        const [h, m] = timeString.split(':').map(Number);
        return h * 60 + m;
    },

    getDateOnly: (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },

    getStartOfWeek: (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    getStartOfMonth: (date) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    },

    getDayName: (dayNumber) => {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return days[dayNumber];
    },

    getShortDayName: (dayNumber) => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        return days[dayNumber];
    },

    isToday: (date) => {
        return utils.formatDate(date) === utils.formatDate(new Date());
    },

    addDays: (date, days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },

    isWorkDay: (date, weekdaySettings) => {
        const dayOfWeek = new Date(date).getDay();
        return weekdaySettings[dayOfWeek]?.isWorkDay !== false;
    }
};

// =====================================================
// MAIN APPLICATION
// =====================================================

class PontoApp {
    constructor() {
        this.db = new Database();
        this.settings = {};
        this.weekdaySettings = {};
        this.currentPage = 'pageHome';
        this.calendarMonth = new Date();
        this.historyFilter = 'all';
        this.lastUpdateTime = 0;
    }

    async init() {
        await this.db.init();
        await this.loadSettings();
        this.setupEventListeners();
        this.startClockUpdate();
        this.updateUI();
    }

    async loadSettings() {
        const defaultSettings = {
            defaultHours: 8,
            hasBreak: true,
            breakDuration: 60
        };

        const saved = await this.db.get('settings', 'default');
        this.settings = saved || defaultSettings;

        // Load weekday settings
        const weekdayData = await this.db.getAll('weekdaySettings');
        for (let day = 0; day < 7; day++) {
            const existing = weekdayData.find(w => w.day === day);
            this.weekdaySettings[day] = existing || {
                day: day,
                isWorkDay: day < 5, // Mon-Fri by default
                hours: this.settings.defaultHours
            };
        }

        this.renderSettings();
        this.updateSettingsUI();
    }

    setupEventListeners() {
        // Punch button
        document.getElementById('punchButton').addEventListener('click', () => this.handlePunchClick());

        // Break toggle
        document.getElementById('hasBreakInput').addEventListener('change', (e) => {
            document.getElementById('breakConfig').style.display = e.target.checked ? 'block' : 'none';
        });

        // Settings inputs
        document.getElementById('defaultHoursInput').addEventListener('change', () => this.saveSettings());
        document.getElementById('hasBreakInput').addEventListener('change', () => this.saveSettings());
        document.getElementById('breakDurationInput').addEventListener('change', () => this.saveSettings());

        // Manual entry date and time defaults
        const today = utils.formatDate(new Date());
        document.getElementById('manualDate').value = today;
        const now = new Date();
        document.getElementById('manualTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Import file preview
        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        const preview = document.getElementById('importPreview');
                        preview.innerHTML = `<strong>Visualização:</strong><br>
                            Registros: ${data.punches?.length || 0}<br>
                            Data mais recente: ${data.punches?.[data.punches.length - 1]?.date || 'N/A'}`;
                        preview.style.display = 'block';
                    } catch (err) {
                        console.error('Invalid JSON:', err);
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    startClockUpdate() {
        const updateClock = () => {
            const now = new Date();
            document.getElementById('clockDisplay').textContent = utils.formatTimeHMS(now);

            const dateDisplay = document.getElementById('dateDisplay');
            const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            dateDisplay.textContent = `${day}/${month}/${now.getFullYear()} — ${days[now.getDay()]}`;

            // Recalcula o contador de "Horas Trabalhadas" a partir dos horários
            // reais registrados + relógio atual (nunca soma +1 cegamente),
            // então funciona corretamente mesmo após o app ficar minimizado.
            this.refreshLiveCounter();
        };

        updateClock();
        setInterval(updateClock, 1000);

        // Quando o app volta a ficar visível (tela desbloqueada, troca de aba,
        // volta do segundo plano), força um recálculo imediato em vez de
        // esperar o próximo tick de 1s, que pode atrasar em mobile.
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateClock();
            }
        });
    }

    renderSettings() {
        const container = document.getElementById('weekdayConfigContainer');
        container.innerHTML = '';

        for (let day = 0; day < 7; day++) {
            const setting = this.weekdaySettings[day];
            const dayName = utils.getDayName(day);

            const section = document.createElement('div');
            section.style.marginBottom = '16px';
            section.style.paddingBottom = '12px';
            section.style.borderBottom = '1px solid var(--border)';

            section.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <strong>${dayName}</strong>
                </div>
                <div class="toggle">
                    <input type="checkbox" id="workday-${day}" class="weekday-toggle" data-day="${day}" ${setting.isWorkDay ? 'checked' : ''}>
                    <label for="workday-${day}">Dia trabalhado</label>
                </div>
                <div class="form-group" ${!setting.isWorkDay ? 'style="display: none;"' : ''} class="hours-config-${day}">
                    <label class="form-label">Horas</label>
                    <input type="number" step="0.5" min="0" value="${setting.hours}" class="form-input weekday-hours" data-day="${day}">
                </div>
            `;

            container.appendChild(section);
        }

        document.querySelectorAll('.weekday-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const day = parseInt(e.target.dataset.day);
                this.weekdaySettings[day].isWorkDay = e.target.checked;
                const hoursConfig = document.querySelector(`.hours-config-${day}`);
                if (hoursConfig) {
                    hoursConfig.style.display = e.target.checked ? 'block' : 'none';
                }
                this.saveSettings();
            });
        });

        document.querySelectorAll('.weekday-hours').forEach(input => {
            input.addEventListener('change', (e) => {
                const day = parseInt(e.target.dataset.day);
                this.weekdaySettings[day].hours = parseFloat(e.target.value);
                this.saveSettings();
            });
        });
    }

    updateSettingsUI() {
        document.getElementById('defaultHoursInput').value = this.settings.defaultHours;
        document.getElementById('hasBreakInput').checked = this.settings.hasBreak;
        document.getElementById('breakDurationInput').value = this.settings.breakDuration;
        document.getElementById('breakConfig').style.display = this.settings.hasBreak ? 'block' : 'none';
    }

    async saveSettings() {
        this.settings.defaultHours = parseFloat(document.getElementById('defaultHoursInput').value) || 8;
        this.settings.hasBreak = document.getElementById('hasBreakInput').checked;
        this.settings.breakDuration = parseInt(document.getElementById('breakDurationInput').value) || 60;

        await this.db.set('settings', { key: 'default', ...this.settings });

        for (let day = 0; day < 7; day++) {
            await this.db.set('weekdaySettings', this.weekdaySettings[day]);
        }

        this.updateUI();
    }

    async handlePunchClick() {
        const todayPunches = await this.getTodayPunches();
        const now = new Date();

        document.getElementById('confirmTime').textContent = utils.formatTimeHMS(now);
        this.openConfirmModal();
    }

    async confirmPunch() {
        const todayPunches = await this.getTodayPunches();
        const now = new Date();
        const type = this.getNextPunchType(todayPunches);

        if (type === 'entry') {
            await this.addPunch('entry', now);
        } else if (type === 'breakStart') {
            await this.addPunch('breakStart', now);
        } else if (type === 'breakEnd') {
            await this.addPunch('breakEnd', now);
        } else if (type === 'exit') {
            await this.addPunch('exit', now);
        }

        this.closeConfirmModal();
        this.updateUI();
    }

    async addPunch(type, date = new Date()) {
        const dateStr = utils.formatDate(date);
        const [h, m] = utils.formatTimeHM(date).split(':').map(Number);
        const currentMinutes = h * 60 + m;

        // Validação: verificar inconsistências
        const dayPunches = await this.getDatePunches(dateStr);
        const validation = this.validatePunchSequence(dayPunches, type, currentMinutes);

        if (!validation.valid) {
            this.showAlert(validation.message, 'error');
            if (!validation.allowAdd) {
                return false;
            }
        }

        const punch = {
            date: dateStr,
            timestamp: date.getTime(),
            type: type,
            time: utils.formatTimeHM(date)
        };

        await this.db.set('punches', punch);
        return true;
    }

    validatePunchSequence(punches, newType, newTime) {
        if (punches.length === 0) {
            if (newType !== 'entry') {
                return { valid: false, message: 'Registre entrada primeiro', allowAdd: false };
            }
            return { valid: true, message: '', allowAdd: true };
        }

        const lastPunch = punches[punches.length - 1];
        const [lastH, lastM] = lastPunch.time.split(':').map(Number);
        const lastTime = lastH * 60 + lastM;

        // Validar ordem
        if (newTime < lastTime) {
            return { valid: false, message: 'Horário não pode ser anterior ao último registro', allowAdd: false };
        }

        // Validar sequência
        const validSequences = {
            'entry': ['breakStart', 'exit'],
            'breakStart': ['breakEnd'],
            'breakEnd': ['breakStart', 'exit'],
            'exit': ['entry']
        };

        if (!validSequences[lastPunch.type]?.includes(newType)) {
            return { 
                valid: false, 
                message: `Sequência inválida: ${lastPunch.type} → ${newType}`, 
                allowAdd: false 
            };
        }

        return { valid: true, message: '', allowAdd: true };
    }

    async addManualEntry() {
        const dateStr = document.getElementById('manualDate').value;
        const timeStr = document.getElementById('manualTime').value;
        const type = document.getElementById('manualType').value;

        if (!dateStr || !timeStr) {
            this.showAlert('Preencha todos os campos', 'error');
            return;
        }

        const [year, month, day] = dateStr.split('-');
        const [hour, minute] = timeStr.split(':');
        const date = new Date(year, month - 1, day, hour, minute, 0);

        const success = await this.addPunch(type, date);

        if (success) {
            this.closeManualEntryModal();
            this.showAlert('Registro adicionado com sucesso', 'success');
            this.updateUI();
        }
        // Se falhou, addPunch já mostrou o alerta de erro e o modal permanece aberto
    }

    async getTodayPunches() {
        const today = utils.formatDate(new Date());
        const punches = await this.db.query('punches', 'date', today);
        return punches.sort((a, b) => a.timestamp - b.timestamp);
    }

    getNextPunchType(todayPunches) {
        if (todayPunches.length === 0) return 'entry';

        const typeSequence = [];
        for (const punch of todayPunches) {
            if (!typeSequence.includes(punch.type)) {
                typeSequence.push(punch.type);
            }
        }

        const lastType = todayPunches[todayPunches.length - 1].type;

        if (lastType === 'entry') return 'breakStart';
        if (lastType === 'breakStart') return 'breakEnd';
        if (lastType === 'breakEnd') return 'breakStart';
        if (lastType === 'exit') return 'entry';

        return 'entry';
    }

    calculateTodayHours() {
        const punches = this.todayPunches || [];
        const todayStr = utils.formatDate(new Date());
        return this.calculateDateHours(punches, todayStr);
    }

    getExpectedMinutesForDate(dateStr) {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        const isWorkDay = this.weekdaySettings[dayOfWeek]?.isWorkDay;
        if (!isWorkDay) return 0;
        return (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60;
    }

    // Comparação com a jornada prevista — usada APENAS no campo separado
    // "Comparação com a Jornada". NUNCA deve ser usada para diminuir o
    // contador principal de "Horas Trabalhadas".
    calculateTodayComparison() {
        const todayStr = utils.formatDate(new Date());
        const expectedMinutes = this.getExpectedMinutesForDate(todayStr);
        const workedMinutes = this.calculateTodayHours();
        return workedMinutes - expectedMinutes;
    }

    async getDatePunches(dateStr) {
        const punches = await this.db.query('punches', 'date', dateStr);
        return punches.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Calcula os minutos trabalhados em um conjunto de registros de um dia.
     *
     * Cada "segmento" de trabalho ativo (da entrada até o início do intervalo,
     * ou do fim do intervalo até a saída) é somado assim que é fechado — por
     * isso o contador reflete corretamente o tempo já acumulado ANTES de um
     * intervalo, mesmo que a saída ainda não tenha sido registrada.
     *
     * @param {Array} punches - Registros do dia, ordenados por horário.
     * @param {string|null} dateStr - Data (YYYY-MM-DD) desses registros.
     *   Se informada E for o dia de hoje E ainda houver um segmento de
     *   trabalho ATIVO (entrada ou fim de intervalo sem saída/intervalo
     *   seguinte), o tempo é estendido em tempo real até o relógio atual do
     *   dispositivo. Isso garante que o contador continue correto mesmo que
     *   o app tenha ficado minimizado/bloqueado por um tempo — o cálculo
     *   sempre parte dos horários reais registrados, nunca de um contador
     *   que soma +1 a cada tick.
     *
     * Durante o intervalo (após "breakStart" e antes de "breakEnd"), nenhum
     * segmento está ativo, então o contador fica corretamente PAUSADO no
     * valor acumulado até aquele momento — não volta a zero.
     *
     * O resultado NUNCA é negativo.
     */
    calculateDateHours(punches, dateStr = null) {
        if (punches.length === 0) return 0;

        let totalMinutes = 0;
        let segmentStart = null; // início do segmento de trabalho ativo (entrada ou volta do intervalo)

        for (const punch of punches) {
            const [h, m] = punch.time.split(':').map(Number);
            const minutes = h * 60 + m;

            if (punch.type === 'entry') {
                // Inicia (ou reinicia) um segmento de trabalho ativo
                segmentStart = minutes;
            } else if (punch.type === 'breakStart') {
                // Fecha o segmento ativo e pausa (intervalo não conta como trabalhado)
                if (segmentStart !== null) {
                    totalMinutes += Math.max(0, minutes - segmentStart);
                    segmentStart = null;
                }
            } else if (punch.type === 'breakEnd') {
                // Retoma um novo segmento de trabalho ativo
                segmentStart = minutes;
            } else if (punch.type === 'exit') {
                // Fecha o segmento ativo e finaliza o dia
                if (segmentStart !== null) {
                    totalMinutes += Math.max(0, minutes - segmentStart);
                    segmentStart = null;
                }
            }
        }

        // Extensão ao vivo: só quando é o dia de hoje e existe um segmento
        // de trabalho ainda ATIVO (entrou ou voltou do intervalo, mas ainda
        // não iniciou intervalo nem bateu saída).
        const todayStr = utils.formatDate(new Date());
        const isToday = dateStr === todayStr;

        if (isToday && segmentStart !== null) {
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
            totalMinutes += Math.max(0, nowMinutes - segmentStart);
        }

        return Math.max(0, Math.floor(totalMinutes)); // Nunca retornar negativo
    }

    async calculateDateBalance(dateStr, punches) {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        const isWorkDay = this.weekdaySettings[dayOfWeek]?.isWorkDay;
        
        if (!isWorkDay) return 0;

        const expectedHours = (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60;
        const workedMinutes = this.calculateDateHours(punches, dateStr);
        return workedMinutes - expectedHours;
    }

    async updateUI() {
        // Get today's data
        this.todayPunches = await this.getTodayPunches();

        // Update punch button
        this.updatePunchButton();

        // Horas Trabalhadas (contador principal — nunca negativo, com extensão ao vivo)
        this.refreshLiveCounter();

        // Update next steps
        this.updateNextSteps();

        // Update dashboard
        await this.updateDashboard();

        // Update history
        await this.updateHistory();

        // Update calendar
        this.updateCalendar();
    }

    // Recalcula e atualiza na tela apenas o contador de "Horas Trabalhadas"
    // (e os campos de referência ao lado) de forma barata — sem acessar o
    // IndexedDB — usando os registros de hoje já em memória e o relógio
    // atual do dispositivo. Chamado a cada segundo e sempre que a aba volta
    // a ficar visível, para nunca ficar "parado" ou desatualizado.
    refreshLiveCounter() {
        const todayHours = this.calculateTodayHours();
        const todayExpected = this.getExpectedMinutesForDate(utils.formatDate(new Date()));
        const todayComparison = todayHours - todayExpected;

        const hoursEl = document.getElementById('todayHours');
        if (hoursEl) {
            hoursEl.textContent = utils.formatTime(todayHours);
        }

        const expectedEl = document.getElementById('todayExpected');
        if (expectedEl) {
            expectedEl.textContent = utils.formatTime(todayExpected);
        }

        const comparisonEl = document.getElementById('todayBalance');
        if (comparisonEl) {
            comparisonEl.textContent = utils.formatTime(todayComparison);
            comparisonEl.style.color = todayComparison >= 0 ? 'var(--success)' : 'var(--danger)';
        }
    }

    updatePunchButton() {
        const button = document.getElementById('punchButton');
        const todayPunches = this.todayPunches || [];
        const type = this.getNextPunchType(todayPunches);

        const config = {
            entry: { text: '🟢 REGISTRAR ENTRADA', class: 'entry' },
            breakStart: { text: '🟡 INICIAR INTERVALO', class: 'break' },
            breakEnd: { text: '🔵 FINALIZAR INTERVALO', class: 'return' },
            exit: { text: '🔴 REGISTRAR SAÍDA', class: 'exit' }
        };

        const current = config[type] || config.entry;
        button.textContent = current.text;
        button.className = `punch-button ${current.class}`;
    }

    updateNextSteps() {
        const punches = this.todayPunches || [];
        let html = '';

        if (punches.length === 0) {
            html = '📍 Registre sua entrada para começar o dia.';
        } else {
            const lastPunch = punches[punches.length - 1];
            const nextType = this.getNextPunchType(punches);

            const steps = {
                entry: '✓ Entrada registrada',
                breakStart: '✓ Intervalo iniciado',
                breakEnd: '✓ Intervalo finalizado',
                exit: '✓ Saída registrada'
            };

            const nextSteps = {
                entry: 'Próximo: Registre a entrada',
                breakStart: 'Próximo: Inicie o intervalo',
                breakEnd: 'Próximo: Finalize o intervalo',
                exit: 'Próximo: Registre a saída'
            };

            for (const punch of punches) {
                html += `${steps[punch.type]} às ${punch.time}<br>`;
            }

            html += `<br><strong>${nextSteps[nextType]}</strong>`;
        }

        document.getElementById('nextStepsDisplay').innerHTML = html;
    }

    async updateDashboard() {
        const allPunches = await this.db.getAll('punches');
        const todayStr = utils.formatDate(new Date());

        // Hoje (com extensão ao vivo se ainda estiver trabalhando)
        const todayPunches = allPunches.filter(p => p.date === todayStr);
        const todayHours = this.calculateDateHours(todayPunches, todayStr);

        // Esta semana
        const weekStart = utils.getStartOfWeek(new Date());
        let weekHours = 0;
        for (let i = 0; i < 7; i++) {
            const checkDate = utils.addDays(weekStart, i);
            const dateStr = utils.formatDate(checkDate);
            const dayPunches = allPunches.filter(p => p.date === dateStr);
            weekHours += this.calculateDateHours(dayPunches, dateStr);
        }

        // Este mês + previsto real do mês (soma apenas dos dias configurados como trabalho)
        const monthStart = utils.getStartOfMonth(new Date());
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        let monthHours = 0;
        let expectedMonthMinutes = 0;
        for (let day = 1; day <= monthEnd.getDate(); day++) {
            const checkDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
            const dateStr = utils.formatDate(checkDate);
            const dayPunches = allPunches.filter(p => p.date === dateStr);
            monthHours += this.calculateDateHours(dayPunches, dateStr);

            const dayOfWeek = checkDate.getDay();
            if (this.weekdaySettings[dayOfWeek]?.isWorkDay) {
                expectedMonthMinutes += (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60;
            }
        }

        const uniqueDates = [...new Set(allPunches.map(p => p.date))];

        // Total trabalhado acumulado = soma de TODOS os dias com registros. Nunca negativo.
        let totalWorked = 0;
        for (const dateStr of uniqueDates) {
            const dayPunches = allPunches.filter(p => p.date === dateStr);
            totalWorked += this.calculateDateHours(dayPunches, dateStr);
        }

        // Comparação com a jornada — informação separada, só para referência
        let totalExtra = 0;
        let totalDeficit = 0;
        for (const dateStr of uniqueDates) {
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const isWorkDay = this.weekdaySettings[dayOfWeek]?.isWorkDay;

            if (!isWorkDay) continue;

            const dayPunches = allPunches.filter(p => p.date === dateStr);
            const dayHours = this.calculateDateHours(dayPunches, dateStr);
            const expectedHours = (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60;
            const diff = dayHours - expectedHours;

            if (diff > 0) totalExtra += diff;
            if (diff < 0) totalDeficit += Math.abs(diff);
        }

        document.getElementById('summaryToday').textContent = utils.formatTime(todayHours);
        document.getElementById('summaryWeek').textContent = utils.formatTime(weekHours);
        document.getElementById('summaryMonth').textContent = utils.formatTime(monthHours);
        document.getElementById('summaryExpected').textContent = utils.formatTime(expectedMonthMinutes);
        document.getElementById('summaryExtra').textContent = utils.formatTime(totalExtra);
        document.getElementById('summaryDeficit').textContent = utils.formatTime(totalDeficit);

        // Total Trabalhado (Acumulado) — sempre >= 0, nunca mostra saldo negativo
        const balanceEl = document.getElementById('summaryBalance');
        balanceEl.textContent = utils.formatTime(Math.max(0, totalWorked));
        balanceEl.style.color = 'var(--success)';
    }

    async updateHistory() {
        const container = document.getElementById('historyContainer');
        const allPunches = await this.db.getAll('punches');
        const uniqueDates = [...new Set(allPunches.map(p => p.date))].sort().reverse();

        let filteredDates = uniqueDates;

        if (this.historyFilter === 'today') {
            const today = utils.formatDate(new Date());
            filteredDates = uniqueDates.filter(d => d === today);
        } else if (this.historyFilter === 'week') {
            const weekStart = utils.getStartOfWeek(new Date());
            const weekEnd = utils.addDays(weekStart, 6);
            filteredDates = uniqueDates.filter(d => {
                const date = new Date(d);
                return date >= weekStart && date <= weekEnd;
            });
        } else if (this.historyFilter === 'month') {
            const monthStart = utils.getStartOfMonth(new Date());
            const now = new Date();
            filteredDates = uniqueDates.filter(d => {
                const date = new Date(d);
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
        }

        if (filteredDates.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">Nenhum registro encontrado</div>';
            return;
        }

        let html = '';
        for (const dateStr of filteredDates) {
            const dayPunches = allPunches.filter(p => p.date === dateStr);
            const dayHours = this.calculateDateHours(dayPunches, dateStr);
            const date = new Date(dateStr);
            const dayOfWeek = date.getDay();
            const expectedHours = this.weekdaySettings[dayOfWeek]?.isWorkDay ? 
                (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60 : 0;
            const comparison = dayHours - expectedHours;

            const timeEntries = dayPunches.map(p => `${p.type === 'entry' ? '📍' : p.type === 'breakStart' ? '⏸️' : p.type === 'breakEnd' ? '▶️' : '🚪'} ${p.time}`).join(' ');

            html += `
                <div class="history-item" onclick="app.openDayDetailsModal('${dateStr}')">
                    <div class="history-date">${utils.formatDateDisplay(dateStr)}</div>
                    <div class="history-time">${timeEntries}</div>
                    <div class="history-stats">
                        <div class="stat-badge">Trabalhado: <strong>${utils.formatTime(dayHours)}</strong></div>
                        <div class="stat-badge">Previsto: ${utils.formatTime(expectedHours)}</div>
                        <div class="stat-badge">Comparação: <strong style="color: ${comparison >= 0 ? 'var(--success)' : 'var(--danger)'}">${utils.formatTime(comparison)}</strong></div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    async updateCalendar() {
        const container = document.getElementById('calendarContainer');
        const monthDisplay = document.getElementById('monthDisplay');

        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthDisplay.textContent = `${monthNames[this.calendarMonth.getMonth()]} ${this.calendarMonth.getFullYear()}`;

        const firstDay = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth(), 1);
        const lastDay = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 0);
        const startDate = utils.getStartOfWeek(firstDay);

        let html = '';

        // Day names
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        for (const name of dayNames) {
            html += `<div class="calendar-day-name">${name}</div>`;
        }

        const allPunches = await this.db.getAll('punches');

        // Days
        for (let i = 0; i < 42; i++) {
            const currentDate = utils.addDays(startDate, i);
            const dateStr = utils.formatDate(currentDate);
            const dayNumber = currentDate.getDate();
            const isCurrentMonth = currentDate.getMonth() === this.calendarMonth.getMonth();

            if (!isCurrentMonth) {
                html += `<div class="calendar-day empty"></div>`;
                continue;
            }

            const dayPunches = allPunches.filter(p => p.date === dateStr);
            const dayOfWeek = currentDate.getDay();
            const isWorkDay = this.weekdaySettings[dayOfWeek]?.isWorkDay;

            let status = 'empty-day';
            let display = dayNumber;

            if (dayPunches.length > 0 && isWorkDay) {
                const dayHours = this.calculateDateHours(dayPunches, dateStr);
                const expectedHours = (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60;
                const comparison = dayHours - expectedHours;

                if (Math.abs(dayHours - expectedHours) < 1) {
                    status = 'completed';
                    display = '✓';
                } else if (comparison > 0) {
                    status = 'extra';
                    display = '+';
                } else {
                    status = 'incomplete';
                    display = '-';
                }
            } else if (!isWorkDay) {
                status = 'off';
                display = 'F';
            }

            html += `<div class="calendar-day ${status}" onclick="app.openCalendarDayDetails('${dateStr}')">${display}</div>`;
        }

        container.innerHTML = html;
    }

    async openCalendarDayDetails(dateStr) {
        const punches = await this.getDatePunches(dateStr);
        if (punches.length > 0) {
            this.openDayDetailsModal(dateStr);
        }
    }

    async openDayDetailsModal(dateStr = utils.formatDate(new Date())) {
        const punches = await this.getDatePunches(dateStr);
        const dayHours = this.calculateDateHours(punches, dateStr);
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        const isWorkDay = this.weekdaySettings[dayOfWeek]?.isWorkDay;
        const expectedHours = isWorkDay ? (this.weekdaySettings[dayOfWeek]?.hours || this.settings.defaultHours) * 60 : 0;
        const comparison = dayHours - expectedHours;

        let html = `<div class="card" style="margin-bottom: 16px;">
            <div class="card-title">${utils.formatDateDisplay(dateStr)}</div>
            <div class="history-stats">
                <div class="stat-badge">Trabalhado: <strong>${utils.formatTime(dayHours)}</strong></div>
                <div class="stat-badge">Previsto: <strong>${utils.formatTime(expectedHours)}</strong></div>
                <div class="stat-badge">Comparação: <strong style="color: ${comparison >= 0 ? 'var(--success)' : 'var(--danger)'}">${utils.formatTime(comparison)}</strong></div>
            </div>
        </div>`;

        if (punches.length > 0) {
            html += '<div class="card"><div class="card-title">Registros do Dia</div>';
            for (const punch of punches) {
                const typeLabel = {
                    entry: 'Entrada',
                    breakStart: 'Início Intervalo',
                    breakEnd: 'Fim Intervalo',
                    exit: 'Saída'
                };
                html += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);">
                    <div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${typeLabel[punch.type]}</div>
                        <div style="font-family: monospace; font-weight: 600; font-size: 16px;">${punch.time}</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="button-primary" style="padding: 6px 10px; font-size: 11px;" onclick="app.openEditPunchModal(${punch.id}, '${dateStr}')">✏️</button>
                        <button class="button-danger" style="padding: 6px 10px; font-size: 11px;" onclick="app.deletePunch(${punch.id}, '${dateStr}')">🗑️</button>
                    </div>
                </div>`;
            }
            html += '</div>';
        }

        // Notes
        const note = await this.db.get('notes', dateStr);
        html += `<div class="card">
            <div class="card-title">Observações</div>
            <textarea class="form-textarea" id="dayNote" placeholder="Adicione uma observação...">${note?.text || ''}</textarea>
            <button class="button-primary" style="margin-top: 12px; width: 100%;" onclick="app.saveNote('${dateStr}')">Salvar Observação</button>
        </div>`;

        document.getElementById('dayDetailsContent').innerHTML = html;
        document.getElementById('dayDetailsModal').classList.add('active');
    }

    async deletePunch(id, dateStr) {
        if (confirm('Tem certeza que deseja deletar este registro?')) {
            await this.db.delete('punches', id);
            this.showAlert('Registro deletado', 'success');
            this.openDayDetailsModal(dateStr);
            this.updateUI();
        }
    }

    async openEditPunchModal(id, dateStr) {
        const allPunches = await this.db.getAll('punches');
        const punch = allPunches.find(p => p.id === id);

        if (!punch) {
            this.showAlert('Registro não encontrado', 'error');
            return;
        }

        // Armazenar ID temporariamente para salvar depois
        window.editingPunchId = id;
        window.editingDateStr = dateStr;

        const editHtml = `
            <div class="modal-header">Editar Registro</div>
            <div class="card">
                <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select id="editPunchType" class="form-select">
                        <option value="entry" ${punch.type === 'entry' ? 'selected' : ''}>Entrada</option>
                        <option value="breakStart" ${punch.type === 'breakStart' ? 'selected' : ''}>Início Intervalo</option>
                        <option value="breakEnd" ${punch.type === 'breakEnd' ? 'selected' : ''}>Fim Intervalo</option>
                        <option value="exit" ${punch.type === 'exit' ? 'selected' : ''}>Saída</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Horário</label>
                    <input type="time" id="editPunchTime" class="form-input" value="${punch.time}">
                </div>
            </div>
            <div class="button-group" style="margin-top: 20px;">
                <button class="button-primary" onclick="app.confirmEditPunch()">Salvar</button>
                <button class="button-secondary" onclick="app.cancelEditPunch()">Cancelar</button>
            </div>
        `;

        document.getElementById('dayDetailsContent').innerHTML = editHtml;
    }

    validateFullDaySequence(punches) {
        // Valida a sequência completa de um dia (já ordenada por horário)
        // Retorna { valid: true } ou { valid: false, message: '...' }
        const validTransitions = {
            'start': ['entry'],
            'entry': ['breakStart', 'exit'],
            'breakStart': ['breakEnd'],
            'breakEnd': ['breakStart', 'exit'],
            'exit': ['entry']
        };

        let state = 'start';
        let lastMinutes = -1;

        for (const punch of punches) {
            const [h, m] = punch.time.split(':').map(Number);
            const minutes = h * 60 + m;

            if (minutes < lastMinutes) {
                return { valid: false, message: 'Horários fora de ordem' };
            }
            lastMinutes = minutes;

            if (!validTransitions[state]?.includes(punch.type)) {
                return { valid: false, message: `Sequência inválida próximo de ${punch.time}` };
            }

            state = punch.type;
        }

        return { valid: true };
    }

    async confirmEditPunch() {
        const id = window.editingPunchId;
        const dateStr = window.editingDateStr;
        const newType = document.getElementById('editPunchType').value;
        const newTime = document.getElementById('editPunchTime').value;

        if (!newTime) {
            this.showAlert('Preencha o horário', 'error');
            return;
        }

        // Construir a sequência hipotética do dia COM a edição aplicada,
        // sem deletar nada do banco ainda (evita perda de dados se inválido)
        const dayPunches = await this.getDatePunches(dateStr);
        const otherPunches = dayPunches.filter(p => p.id !== id);
        const editedPunch = { id, date: dateStr, type: newType, time: newTime };
        const hypotheticalSequence = [...otherPunches, editedPunch].sort((a, b) => {
            const [ah, am] = a.time.split(':').map(Number);
            const [bh, bm] = b.time.split(':').map(Number);
            return (ah * 60 + am) - (bh * 60 + bm);
        });

        const validation = this.validateFullDaySequence(hypotheticalSequence);

        if (!validation.valid) {
            this.showAlert('Não foi possível salvar: ' + validation.message, 'error');
            return; // Nada foi alterado no banco - dado original preservado
        }

        // Sequência válida - agora sim aplicar a mudança
        const [year, month, day] = dateStr.split('-');
        const [hour, minute] = newTime.split(':');
        const newDate = new Date(year, month - 1, day, hour, minute, 0);

        await this.db.delete('punches', id);
        await this.db.set('punches', {
            date: dateStr,
            timestamp: newDate.getTime(),
            type: newType,
            time: newTime
        });

        this.showAlert('Registro atualizado', 'success');
        this.openDayDetailsModal(dateStr);
        this.updateUI();
    }

    cancelEditPunch() {
        const dateStr = window.editingDateStr;
        this.openDayDetailsModal(dateStr);
    }

    async saveNote(dateStr) {
        const text = document.getElementById('dayNote').value;
        await this.db.set('notes', { date: dateStr, text });
        this.showAlert('Observação salva', 'success');
    }

    previousMonth() {
        this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
        this.updateCalendar();
    }

    nextMonth() {
        this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
        this.updateCalendar();
    }

    setHistoryFilter(filter) {
        this.historyFilter = filter;
        document.querySelectorAll('.filter-tab').forEach(tab => {
            if (tab.textContent.toLowerCase() === filter || 
                (filter === 'all' && tab.textContent.toLowerCase() === 'tudo') ||
                (filter === 'today' && tab.textContent.toLowerCase() === 'hoje') ||
                (filter === 'week' && tab.textContent.toLowerCase() === 'semana') ||
                (filter === 'month' && tab.textContent.toLowerCase() === 'mês')) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        this.updateHistory();
    }

    goToPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

        // Show selected page
        document.getElementById(pageId).classList.add('active');

        // Update nav - encontrar o botão correspondente
        const pageMap = {
            'pageHome': 0,
            'pageHistory': 1,
            'pageCalendar': 2,
            'pageSummary': 3,
            'pageSettings': 4
        };

        document.querySelectorAll('.nav-item').forEach((item, index) => {
            if (index === pageMap[pageId]) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        this.currentPage = pageId;

        // Update UI for this page
        if (pageId === 'pageCalendar') {
            this.updateCalendar();
        } else if (pageId === 'pageSummary') {
            this.updateDashboard();
        } else if (pageId === 'pageHistory') {
            this.updateHistory();
        }
    }

    // Modals
    closeModalOnBackdrop(event, modalId) {
        // Só fecha se o toque foi realmente no fundo (backdrop),
        // não em elementos filhos como inputs, botões, etc.
        if (event.target.id === modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
        }
    }

    openConfirmModal() {
        document.getElementById('confirmPunchModal').classList.add('active');
    }

    closeConfirmModal() {
        document.getElementById('confirmPunchModal').classList.remove('active');
    }

    openManualEntryModal() {
        const today = utils.formatDate(new Date());
        document.getElementById('manualDate').value = today;
        const now = new Date();
        document.getElementById('manualTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        document.getElementById('manualEntryModal').classList.add('active');
    }

    closeManualEntryModal() {
        document.getElementById('manualEntryModal').classList.remove('active');
    }

    openImportModal() {
        document.getElementById('importFile').value = '';
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('importModal').classList.add('active');
    }

    closeImportModal() {
        document.getElementById('importModal').classList.remove('active');
    }

    closeDayDetailsModal() {
        document.getElementById('dayDetailsModal').classList.remove('active');
    }

    async exportBackup() {
        const punches = await this.db.getAll('punches');
        const settings = await this.db.get('settings', 'default');
        const weekdaySettings = await this.db.getAll('weekdaySettings');
        const notes = await this.db.getAll('notes');

        const backup = {
            version: 1,
            exportDate: new Date().toISOString(),
            punches,
            settings,
            weekdaySettings,
            notes
        };

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-controle-ponto-${utils.formatDate(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showAlert('Backup exportado com sucesso', 'success');
    }

    async importBackup() {
        const file = document.getElementById('importFile').files[0];
        if (!file) {
            this.showAlert('Selecione um arquivo', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backup = JSON.parse(event.target.result);

                // Validar estrutura do backup
                if (!backup.punches || !Array.isArray(backup.punches)) {
                    this.showAlert('Arquivo de backup inválido', 'error');
                    return;
                }

                if (confirm('Isso vai sobrescrever seus dados atuais. Tem certeza?\n\nRegistros a restaurar: ' + backup.punches.length)) {
                    // Clear existing data
                    await this.db.clear('punches');
                    await this.db.clear('notes');

                    // Import new data
                    for (const punch of backup.punches) {
                        await this.db.set('punches', punch);
                    }

                    if (backup.settings) {
                        await this.db.set('settings', backup.settings);
                    } else {
                        // Usar padrão se não houver
                        await this.db.set('settings', { 
                            key: 'default',
                            defaultHours: 8,
                            hasBreak: true,
                            breakDuration: 60
                        });
                    }

                    if (backup.weekdaySettings && Array.isArray(backup.weekdaySettings)) {
                        for (const setting of backup.weekdaySettings) {
                            await this.db.set('weekdaySettings', setting);
                        }
                    }

                    if (backup.notes && Array.isArray(backup.notes)) {
                        for (const note of backup.notes) {
                            await this.db.set('notes', note);
                        }
                    }

                    this.closeImportModal();
                    await this.loadSettings();
                    this.updateUI();
                    this.showAlert('Backup importado com sucesso! ' + backup.punches.length + ' registros restaurados', 'success');
                }
            } catch (err) {
                this.showAlert('Erro ao importar backup: ' + err.message, 'error');
                console.error(err);
            }
        };

        reader.readAsText(file);
    }

    async clearAllData() {
        if (confirm('ATENÇÃO: Isso vai deletar TODOS os seus dados. Tem certeza?')) {
            if (confirm('Dados não podem ser recuperados. Tem ABSOLUTA certeza?')) {
                await this.db.clear('punches');
                await this.db.clear('notes');
                await this.db.clear('settings');
                await this.db.clear('weekdaySettings');
                this.showAlert('Todos os dados foram deletados', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        }
    }

    showAlert(message, type = 'info') {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        container.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

// =====================================================
// INITIALIZATION
// =====================================================

const app = new PontoApp();

document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(err => {
        console.error('Failed to initialize app:', err);
        document.getElementById('alertContainer').innerHTML = '<div class="alert error">Erro ao inicializar aplicativo</div>';
    });
});
