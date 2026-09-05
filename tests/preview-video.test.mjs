import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('preview serves bounded video ranges for scroll seeking',async()=>{
  const server=spawn(process.execPath,['tools/server.js','8139'],{cwd:new URL('../',import.meta.url),stdio:['ignore','pipe','pipe']});
  try {
    await once(server.stdout,'data');
    const response=await fetch('http://127.0.0.1:8139/assets/video/youth-particles-scrub.mp4',{headers:{Range:'bytes=0-31'}});
    assert.equal(response.status,206);
    assert.equal(response.headers.get('accept-ranges'),'bytes');
    assert.equal((await response.arrayBuffer()).byteLength,32);
    const invalid=await fetch('http://127.0.0.1:8139/assets/video/youth-particles-scrub.mp4',{headers:{Range:'bytes=999999999-'}});
    assert.equal(invalid.status,416);
  } finally {server.kill();}
});
