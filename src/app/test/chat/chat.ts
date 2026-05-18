import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignalRService, ChatMessage } from '../signalr.service';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule,BrowserModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
@ViewChild('messageContainer') messageContainer!: ElementRef;
  
  activeTab: 'broadcast' | 'private' | 'group' = 'broadcast';
  messageForm: FormGroup;
  groupForm: FormGroup;
  currentGroup = '';
  selectedUser = '';
  onlineUsers: any[] = [];
  availableGroups = ['General', 'Development', 'Marketing', 'Support'];
  
  broadcastMessages: ChatMessage[] = [];
  privateMessages: Map<string, ChatMessage[]> = new Map();
  groupMessages: Map<string, ChatMessage[]> = new Map();
  
  typingUsers: Set<string> = new Set();
  currentUserId = '1'; // À remplacer par l'ID réel
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private signalRService: SignalRService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
    
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required]
    });
  }
  
  async ngOnInit() {
    await this.signalRService.startConnection();
    this.setupSubscriptions();
  }
  
  private setupSubscriptions() {
    // Broadcast messages
    this.subscriptions.push(
      this.signalRService.getBroadcastMessages().subscribe(messages => {
        this.broadcastMessages = messages;
        this.scrollToBottom();
      })
    );
    
    // Online users
    this.subscriptions.push(
      this.signalRService.getOnlineUsers().subscribe(users => {
        this.onlineUsers = users.map(id => ({ id, name: `User ${id}` }));
      })
    );
    
    // Typing indicator
    this.subscriptions.push(
      this.signalRService.getTypingIndicator().subscribe(typing => {
        if (typing) {
          this.typingUsers.add(typing.userId);
          setTimeout(() => {
            this.typingUsers.delete(typing.userId);
          }, 3000);
        }
      })
    );
  }
  
  // === BROADCAST ===
  sendBroadcast() {
    const message = this.messageForm.get('message')?.value;
    if (message) {
      this.signalRService.sendToAll(message);
      this.messageForm.reset();
    }
  }
  
  // === PRIVATE MESSAGING ===
  selectUser(userId: string) {
    this.selectedUser = userId;
    this.activeTab = 'private';
  }
  
  sendPrivateMessage() {
    const message = this.messageForm.get('message')?.value;
    if (message && this.selectedUser) {
      this.signalRService.sendPrivateMessage(this.selectedUser, message);
      this.messageForm.reset();
    }
  }
  
  onTyping() {
    if (this.selectedUser) {
      this.signalRService.sendTyping(this.selectedUser, true);
      setTimeout(() => {
        this.signalRService.sendTyping(this.selectedUser, false);
      }, 1000);
    }
  }
  
  getPrivateMessagesForUser(userId: string): ChatMessage[] {
    return this.privateMessages.get(userId) || [];
  }
  
  // === GROUP CHAT ===
  joinGroup() {
    const groupName = this.groupForm.get('groupName')?.value;
    if (groupName) {
      this.signalRService.joinGroup(groupName);
      this.currentGroup = groupName;
      this.activeTab = 'group';
      this.groupForm.reset();
    }
  }
  
  leaveGroup() {
    if (this.currentGroup) {
      this.signalRService.leaveGroup(this.currentGroup);
      this.currentGroup = '';
    }
  }
  
  sendGroupMessage() {
    const message = this.messageForm.get('message')?.value;
    if (message && this.currentGroup) {
      this.signalRService.sendToGroup(this.currentGroup, message);
      this.messageForm.reset();
    }
  }
  
  // === MULTI-CAST ===
  sendToMultipleUsers() {
    const selectedUsers = this.onlineUsers
      .filter(u => u.selected)
      .map(u => u.id);
    
    const message = this.messageForm.get('message')?.value;
    if (selectedUsers.length > 0 && message) {
      this.signalRService.sendToMultipleUsers(selectedUsers, message);
      this.messageForm.reset();
    }
  }
  
  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
