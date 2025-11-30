class WorkRequest {
  private form: HTMLFormElement | null;
  private projectType: HTMLSelectElement | null;
  private nameField: HTMLInputElement | null;
  private contactMethod: HTMLSelectElement | null;
  private contactField: HTMLInputElement | null;
  private budgetPreset: HTMLSelectElement | null;
  private budgetField: HTMLInputElement | null;
  private projectDetails: HTMLTextAreaElement | null;
  private statusMsg: HTMLDivElement | null;
  private submitButton: HTMLButtonElement | null;
  private templateButtons: NodeListOf<HTMLButtonElement> | null;

  private templates: Record<string, string> = {
    'discord': "i need a discord bot for my server. [describe what features you want - moderation, music, economy, custom commands, etc]",
    'telegram': "looking for a telegram bot. [tell me what it should do - notifications, group management, automated responses, etc]",
    'website': "want a website built. [explain what kind of site you need - portfolio, landing page, web app, dashboard, etc]",
    'roblox': "need a roblox system. [describe what game features or systems you want - inventory, shops, admin commands, data saving, etc]",
    'custom': "i have something specific in mind. [tell me exactly what you need and how it should work]"
  };

  constructor() {
    this.form = document.getElementById('requestForm') as HTMLFormElement;
    this.projectType = document.getElementById('projectType') as HTMLSelectElement;
    this.nameField = document.getElementById('requestName') as HTMLInputElement;
    this.contactMethod = document.getElementById('contactMethod') as HTMLSelectElement;
    this.contactField = document.getElementById('requestContact') as HTMLInputElement;
    this.budgetPreset = document.getElementById('budgetPreset') as HTMLSelectElement;
    this.budgetField = document.getElementById('requestBudget') as HTMLInputElement;
    this.projectDetails = document.getElementById('requestProject') as HTMLTextAreaElement;
    this.statusMsg = document.getElementById('requestStatus') as HTMLDivElement;
    this.submitButton = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.templateButtons = document.querySelectorAll('.template-btn');
  }

  start(): void {
    if (!this.form) return;

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.send();
    });

    if (this.contactMethod && this.contactField) {
      this.setPlaceholder();
      this.contactMethod.addEventListener('change', () => {
        this.setPlaceholder();
      });
    }

    if (this.budgetPreset && this.budgetField) {
      this.budgetPreset.addEventListener('change', () => {
        this.toggleBudget();
      });
    }

    if (this.templateButtons) {
      this.templateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const template = btn.getAttribute('data-template');
          if (template && this.projectDetails) {
            this.projectDetails.value = this.templates[template] || '';
            this.updateChars();
            this.projectDetails.focus();
            
            // ripple effect
            const ripple = document.createElement('span');
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.cssText = `
              position: absolute;
              left: ${x}px;
              top: ${y}px;
              width: 10px;
              height: 10px;
              background: rgba(255, 107, 107, 0.6);
              border-radius: 50%;
              transform: translate(-50%, -50%) scale(0);
              animation: ripple 0.6s ease-out;
              pointer-events: none;
            `;
            
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
          }
        });
      });
    }

    if (this.projectDetails) {
      this.projectDetails.addEventListener('input', () => {
        this.updateChars();
      });
      this.updateChars();
    }
  }

  private updateChars(): void {
    const cnt = document.getElementById('charCount');
    if (!cnt || !this.projectDetails) return;

    const len = this.projectDetails.value.length;
    const max = 2000;
    cnt.textContent = `${len} / ${max}`;
    
    if (len > max * 0.9) {
      cnt.classList.add('text-accent');
      cnt.classList.remove('text-gray-500');
    } else {
      cnt.classList.add('text-gray-500');
      cnt.classList.remove('text-accent');
    }
  }

  private setPlaceholder(): void {
    if (!this.contactMethod || !this.contactField) return;

    const method = this.contactMethod.value;
    const placeholders: Record<string, string> = {
      'discord': 'username',
      'email': 'email address',
      'telegram': 'username'
    };

    this.contactField.placeholder = placeholders[method] || 'your contact';
    
    if (method === 'email') {
      this.contactField.type = 'email';
    } else {
      this.contactField.type = 'text';
    }
  }

  private toggleBudget(): void {
    if (!this.budgetPreset || !this.budgetField) return;

    const preset = this.budgetPreset.value;
    
    if (preset === 'custom') {
      this.budgetField.classList.remove('hidden');
      this.budgetField.focus();
    } else {
      this.budgetField.classList.add('hidden');
      this.budgetField.value = '';
    }
  }

  private async send(): Promise<void> {
    if (!this.form || !this.nameField || !this.contactField || !this.projectDetails) return;

    const type = this.projectType?.value || '';
    const name = this.nameField.value.trim();
    const method = this.contactMethod?.value || '';
    const contact = this.contactField.value.trim();
    const details = this.projectDetails.value.trim();
    
    let budget = '';
    const preset = this.budgetPreset?.value || '';
    if (preset && preset !== '' && preset !== 'custom') {
      const labels: Record<string, string> = {
        'under-100': 'under $100',
        '100-250': '$100 - $250',
        '250-500': '$250 - $500',
        '500-1000': '$500 - $1000',
        '1000+': '$1000+',
        'negotiable': 'negotiable'
      };
      budget = labels[preset] || '';
    } else if (preset === 'custom') {
      budget = this.budgetField?.value.trim() || '';
    }

    if (!type || !name || !method || !contact || !details) {
      this.showStatus('fill out everything pls', 'error');
      return;
    }

    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        this.showStatus('please enter a valid email address', 'error');
        return;
      }
    }

    const fullContact = `${method}: ${contact}`;

    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = `
        <span class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          sending...
        </span>
      `;
    }

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectType: type,
          name, 
          contact: fullContact, 
          project: details, 
          budget 
        })
      });

      const data = await res.json();

      if (res.ok) {
        this.showStatus('✓ sent! ill hit u up soon', 'success');
        this.form.reset();
        if (this.budgetField) {
          this.budgetField.classList.add('hidden');
        }
        this.updateChars();
      } else {
        if (res.status === 429) {
          this.showStatus('⏱ slow down, wait an hour', 'error');
        } else {
          this.showStatus('✕ ' + (data.error || 'something broke'), 'error');
        }
      }
    } catch (err) {
      console.error('send failed:', err);
      this.showStatus('✕ cant connect, check ur internet', 'error');
    } finally {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.innerHTML = `
          <span class="flex items-center justify-center gap-2">
            send request
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </span>
        `;
      }
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    if (!this.statusMsg) return;

    const bgColor = type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20';
    const borderColor = type === 'success' ? 'border-green-500/50' : 'border-red-500/50';
    const textColor = type === 'success' ? 'text-green-400' : 'text-red-400';

    this.statusMsg.textContent = message;
    this.statusMsg.className = `mt-6 text-center ${textColor} ${bgColor} ${borderColor} border-2 rounded-xl py-4 px-6 font-medium animate-in slide-in-from-bottom-4 duration-300`;
    this.statusMsg.classList.remove('hidden');

    setTimeout(() => {
      if (this.statusMsg) {
        this.statusMsg.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => {
          if (this.statusMsg) {
            this.statusMsg.classList.add('hidden');
            this.statusMsg.classList.remove('opacity-0', 'transition-opacity', 'duration-300');
          }
        }, 300);
      }
    }, 5000);
  }
}

export default WorkRequest;
