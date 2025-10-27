import { Component, OnInit, signal } from '@angular/core';
import { ChatCompletionMessageParam, CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TodoDto } from './todo.dto';

const MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';

@Component({
  selector: 'app-todo',
  imports: [
    MatSelectionList,
    MatListOption,
    MatProgressBar,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatInputModule,
    MatFabButton,
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.scss'
})
export class Todo implements OnInit {
  // LAB #2, #3, #5
  protected readonly progress = signal(0);
  protected readonly ready = signal(false);
  protected engine?: MLCEngine;
  protected readonly reply = signal('');
  protected readonly todos = signal<TodoDto[]>([]);

  async ngOnInit() {
    // LAB #2
    this.engine = await CreateMLCEngine(MODEL, {
      initProgressCallback: ({ progress }) => this.progress.set(progress)
    });
    this.ready.set(true);
  }

  async runPrompt(userPrompt: string, languageModel: string) {
    // LAB #3
    this.reply.set('…');

    const chunks = languageModel === 'webllm'
      ? this.inferWebLLM(userPrompt)
      : this.inferPromptApi(userPrompt);

    let reply = '';
    for await (const chunk of chunks) {
      reply += chunk;
      this.reply.set(reply);
    }
  }

  async* inferWebLLM(userPrompt: string): AsyncGenerator<string> {
    // LAB #3, #7, #8, #9
    await this.engine!.resetChat();
    const messages: ChatCompletionMessageParam[] = [
      {role: "user", content: userPrompt},
    ];
    const chunks = await this.engine!.chat.completions.create({messages, stream: true});
    for await (const chunk of chunks) {
      yield chunk.choices[0]?.delta.content ?? '';
    }
  }

  async* inferPromptApi(userPrompt: string) {
    // LAB #12
  }

  addTodo() {
    // LAB #5
    const text = prompt() ?? '';
    this.todos.update(todos => [...todos, {done: false, text}]);
  }
}
