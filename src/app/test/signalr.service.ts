import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  message: string;
  timestamp: Date;
  type: 'broadcast' | 'private' | 'group' | 'multicast';
  groupName?: string;
  targetUsers?: string[];
}

export interface UserTyping {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface GroupInfo {
  groupName: string;
  members: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private connectionState = new BehaviorSubject<boolean>(false);
  
  // Observables pour les différents types de messages
  private broadcastMessages = new BehaviorSubject<ChatMessage[]>([]);
  private privateMessages = new BehaviorSubject<Map<string, ChatMessage[]>>(new Map());
  private groupMessages = new BehaviorSubject<Map<string, ChatMessage[]>>(new Map());
  private onlineUsers = new BehaviorSubject<string[]>([]);
  private groupMembers = new BehaviorSubject<Map<string, any[]>>(new Map());
  private typingIndicator = new BehaviorSubject<UserTyping | null>(null);
  
  constructor(private ngZone: NgZone) {}
  
  async startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7003/payhubs', {
        withCredentials: true,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    this.registerHandlers();
    
    try {
      await this.hubConnection.start();
      this.connectionState.next(true);
      console.log('SignalR Connected');
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.connectionState.next(false);
    }
    
    this.hubConnection.onreconnecting((error) => {
      console.log('Reconnecting...', error);
      this.connectionState.next(false);
    });
    
    this.hubConnection.onreconnected((connectionId) => {
      console.log('Reconnected:', connectionId);
      this.connectionState.next(true);
    });
  }
  
  private registerHandlers() {
    // Broadcast messages
    this.hubConnection.on('ReceiveBroadcast', (message: ChatMessage) => {
      this.ngZone.run(() => {
        const current = this.broadcastMessages.value;
        this.broadcastMessages.next([...current, message]);
      });
    });
    
    // Private messages
    this.hubConnection.on('ReceivePrivateMessage', (message: ChatMessage) => {
      this.ngZone.run(() => {
        const currentMap = this.privateMessages.value;
        const userMessages = currentMap.get(message.fromUserId) || [];
        currentMap.set(message.fromUserId, [...userMessages, message]);
        this.privateMessages.next(new Map(currentMap));
      });
    });
    
    // Group messages
    this.hubConnection.on('ReceiveGroupMessage', (message: ChatMessage) => {
      this.ngZone.run(() => {
        const currentMap = this.groupMessages.value;
        const groupMsgs = currentMap.get(message.groupName!) || [];
        currentMap.set(message.groupName!, [...groupMsgs, message]);
        this.groupMessages.next(new Map(currentMap));
      });
    });
    
    // Online users
    this.hubConnection.on('UsersOnline', (users: string[]) => {
      this.ngZone.run(() => {
        this.onlineUsers.next(users);
      });
    });
    
    // Group members
    this.hubConnection.on('GroupMembers', (members: any[]) => {
      this.ngZone.run(() => {
        // Update group members logic here
      });
    });
    
    // Typing indicator
    this.hubConnection.on('UserTyping', (typing: UserTyping) => {
      this.ngZone.run(() => {
        this.typingIndicator.next(typing);
        setTimeout(() => {
          if (this.typingIndicator.value?.userId === typing.userId) {
            this.typingIndicator.next(null);
          }
        }, 3000);
      });
    });
    
    // Message sent confirmation
    this.hubConnection.on('MessageSent', (data: any) => {
      console.log('Message sent:', data);
    });
    
    // Message error
    this.hubConnection.on('MessageError', (error: any) => {
      console.error('Message error:', error);
    });
    
    // User joined group
    this.hubConnection.on('UserJoinedGroup', (data: any) => {
      console.log(`${data.userName} joined ${data.groupName}`);
    });
    
    // User left group
    this.hubConnection.on('UserLeftGroup', (data: any) => {
      console.log(`${data.userName} left ${data.groupName}`);
    });
  }
  
  // === MÉTHODES D'ENVOI ===
  sendToAll(message: string): Promise<void> {
    return this.hubConnection.invoke('SendToAll', message);
  }
  
  sendPrivateMessage(targetUserId: string, message: string): Promise<void> {
    return this.hubConnection.invoke('SendPrivateMessage', targetUserId, message);
  }
  
  joinGroup(groupName: string): Promise<void> {
    return this.hubConnection.invoke('JoinGroup', groupName);
  }
  
  leaveGroup(groupName: string): Promise<void> {
    return this.hubConnection.invoke('LeaveGroup', groupName);
  }
  
  sendToGroup(groupName: string, message: string): Promise<void> {
    return this.hubConnection.invoke('SendToGroup', groupName, message);
  }
  
  sendToMultipleUsers(targetUserIds: string[], message: string): Promise<void> {
    return this.hubConnection.invoke('SendToMultipleUsers', targetUserIds, message);
  }
  
  sendTyping(targetUserId: string, isTyping: boolean): Promise<void> {
    return this.hubConnection.invoke('SendTyping', targetUserId, isTyping);
  }
  
  // === GETTERS ===
  getConnectionState(): Observable<boolean> {
    return this.connectionState.asObservable();
  }
  
  getBroadcastMessages(): Observable<ChatMessage[]> {
    return this.broadcastMessages.asObservable();
  }
  
  getPrivateMessages(userId: string): Observable<ChatMessage[]> {
    return new Observable(observer => {
      this.privateMessages.subscribe(map => {
        observer.next(map.get(userId) || []);
      });
    });
  }
  
  getGroupMessages(groupName: string): Observable<ChatMessage[]> {
    return new Observable(observer => {
      this.groupMessages.subscribe(map => {
        observer.next(map.get(groupName) || []);
      });
    });
  }
  
  getOnlineUsers(): Observable<string[]> {
    return this.onlineUsers.asObservable();
  }
  
  getTypingIndicator(): Observable<UserTyping | null> {
    return this.typingIndicator.asObservable();
  }
}