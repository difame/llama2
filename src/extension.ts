import * as vscode from 'vscode';
import * as net from 'net';
import { promisify } from 'util';
import { Socket } from 'net';

export function activate(context: vscode.ExtensionContext) {
	console.log('aaa');
	const ruleCompletion = {
		async provideCompletionItems(
            document: vscode.TextDocument,
            position: vscode.Position,
            token: vscode.CancellationToken,
            context: vscode.CompletionContext
        ): Promise<vscode.CompletionItem[]> {
			console.log('aa2');
			const editor = vscode.window.activeTextEditor;
			const completionItem1 = new vscode.CompletionItem('AI생성 기능추가');
			if (editor) {
				const selection = editor.selection;
				const l = editor.document.lineAt(selection.start.line).text;
				const cursorPosition = selection.start.character;
				const c = l.charAt(cursorPosition - 1);
				console.log('c='+ cursorPosition + ":" +c);
				if (l.indexOf("#") >=0 && c === '.') {
					try {
						const snippetText1 = await synchronousFunction(l);
						completionItem1.insertText = new vscode.SnippetString('\n' + snippetText1);

					} catch (err) {
						console.log('activate err',err);
					}
				}
			}
			return [completionItem1];
		}
	}; 
	const providerCompletion = vscode.languages.registerCompletionItemProvider(
		['plaintext', 'html', 'javascript'], 
		ruleCompletion, '.'
	);

	context.subscriptions.push(
		providerCompletion// ,...
	);
}
function requestWithSocket(host: string, port: number, data: string): Promise<string> {
	return new Promise((resolve, reject) => {
	  const socket: Socket = new Socket();
  
	  // 소켓 연결
	  socket.connect(port, host, () => {
		// 요청 전송
		socket.write(data);
	  });
  
	  // 데이터 수신 시
	  socket.on('data', (responseData: Buffer) => {
		socket.end(); // 소켓 연결 종료
		resolve(responseData.toString());
	  });
  
	  // 오류 발생 시
	  socket.on('error', (error: Error) => {
		socket.destroy(); // 소켓 연결 종료
		reject(error);
	  });
	});
  }
  // 시스템시간을 읽어오는 함수
  // 동기 함수에서 비동기 함수 호출 시 async/await을 사용합니다.
  async function synchronousFunction(send_string: string): Promise<string> {
	try {
		console.log('synchronousFunction', send_string);
		const responseData = await requestWithSocket('jangsooy.iptime.org', 28080, send_string);
		console.log('responseData', responseData);
	  	return responseData;
	} catch (error) {
	  // 오류 처리
	  throw error;
	}
  }

// This method is called when your extension is deactivated
export function deactivate() {}
