import type { MFEServices } from '@mfe-toolkit/core';

type User = {
  id: string;
  name: string;
  status: 'online' | 'typing' | 'idle';
  avatar: string;
  joinedAt: number;
};

export class OnlineUsers {
  private users: Map<string, User> = new Map();
  private container: HTMLElement;
  private services: MFEServices;
  private unsubscribers: Array<() => void> = [];

  constructor(container: HTMLElement, services: MFEServices) {
    this.container = container;
    this.services = services;
    this.init();
  }

  private init() {
    // Add some initial users
    this.addUser('You', 'online');
    
    // Subscribe to events
    this.unsubscribers.push(
      this.services.eventBus.on('user:joined', (payload) => {
        const userName = payload.data?.user || `User ${this.users.size + 1}`;
        this.addUser(userName, 'online');
      })
    );

    this.unsubscribers.push(
      this.services.eventBus.on('user:left', (payload) => {
        const userName = payload.data?.user;
        if (userName) {
          this.removeUser(userName);
        }
      })
    );

    this.unsubscribers.push(
      this.services.eventBus.on('user:typing', (payload) => {
        const userName = payload.data?.user;
        if (userName) {
          this.updateUserStatus(userName, 'typing');
        }
      })
    );

    this.unsubscribers.push(
      this.services.eventBus.on('user:stopped-typing', (payload) => {
        const userName = payload.data?.user;
        if (userName) {
          this.updateUserStatus(userName, 'online');
        }
      })
    );

    // Simulate some users joining
    setTimeout(() => {
      this.services.eventBus.emit('user:joined', { user: 'Alice Chen' });
    }, 2000);

    setTimeout(() => {
      this.services.eventBus.emit('user:joined', { user: 'Bob Smith' });
    }, 4000);

    this.render();
  }

  private addUser(name: string, status: User['status']) {
    const userId = name.toLowerCase().replace(/\s+/g, '-');
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        id: userId,
        name,
        status,
        avatar: this.getAvatar(name),
        joinedAt: Date.now()
      });
      this.render();
    }
  }

  private removeUser(name: string) {
    const userId = name.toLowerCase().replace(/\s+/g, '-');
    if (this.users.delete(userId)) {
      this.render();
    }
  }

  private updateUserStatus(name: string, status: User['status']) {
    const userId = name.toLowerCase().replace(/\s+/g, '-');
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      this.render();
    }
  }

  private getAvatar(name: string): string {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return initials;
  }

  private getStatusIndicator(status: User['status']): string {
    switch (status) {
      case 'online': return '🟢';
      case 'typing': return '💬';
      case 'idle': return '🟡';
      default: return '⚫';
    }
  }

  private render() {
    const usersList = Array.from(this.users.values());
    
    this.container.innerHTML = `
      <div class="ds-card ds-p-4">
        <div class="ds-flex ds-justify-between ds-items-center ds-mb-4">
          <h4 class="ds-card-title ds-mb-0">👥 Online Users</h4>
          <span class="ds-badge-success">${usersList.length} online</span>
        </div>

        <div class="ds-space-y-2">
          ${usersList.map(user => `
            <div class="ds-flex ds-items-center ds-gap-3 ds-p-2 ds-rounded ds-bg-slate-50 ds-hover:bg-slate-100 ds-transition-colors">
              <div class="ds-relative">
                <div class="ds-w-10 ds-h-10 ds-rounded-full ds-bg-accent-primary ds-text-white ds-flex ds-items-center ds-justify-center ds-text-sm ds-font-semibold">
                  ${user.avatar}
                </div>
                <span class="ds-absolute ds-bottom-0 ds-right-0 ds-text-xs">
                  ${this.getStatusIndicator(user.status)}
                </span>
              </div>
              <div class="ds-flex-1">
                <div class="ds-text-sm ds-font-medium">${user.name}</div>
                <div class="ds-text-xs ds-text-muted">
                  ${user.status === 'typing' ? 'Typing...' : 'Active'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="ds-mt-4 ds-pt-3 ds-border-t">
          <button 
            id="invite-btn"
            class="ds-btn-outline ds-btn-sm ds-w-full"
          >
            ➕ Invite Collaborator
          </button>
        </div>

        <div class="ds-border-t ds-pt-2 ds-mt-3">
          <div class="ds-text-xs ds-text-muted">
            <p>🟢 Online • 💬 Typing • 🟡 Idle</p>
          </div>
        </div>
      </div>
    `;

    // Add event listener for invite button
    const inviteBtn = this.container.querySelector('#invite-btn');
    if (inviteBtn) {
      inviteBtn.addEventListener('click', () => {
        const names = ['Carol Davis', 'David Wilson', 'Emma Brown', 'Frank Miller'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        
        this.services.eventBus.emit('user:joined', { user: randomName });
        
        this.services.notifications?.addNotification({
          type: 'success',
          title: 'Invitation Sent',
          message: `Invited ${randomName} to collaborate`
        });
      });
    }
  }

  public destroy() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.users.clear();
    this.container.innerHTML = '';
  }
}