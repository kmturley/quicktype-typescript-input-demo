import { mkdirSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { basename, dirname, extname } from 'path';
import { InputData, JSONSchemaInput, JSONSchemaSourceData, JSONSchemaStore, MultiFileRenderResult, RendererOptions, SerializedRenderResult, quicktypeMultiFile } from 'quicktype-core';
import { schemaForTypeScriptSources } from 'quicktype-typescript-input';

interface Config {
  lang: string;
  ext: string;
  rendererOptions: RendererOptions
}

async function load(globPath: string, configs: Config[]) {
  const filePaths: string[] = globSync(globPath);
  const filePathMap: any = {};
  filePaths.forEach(filePath => filePathMap[basename(filePath, extname(filePath))] = filePath.replace(extname(filePath), ''));
  console.log(`📁 ${filePaths}`);
  console.log(filePathMap);
  const jsonSchema: JSONSchemaSourceData = schemaForTypeScriptSources(filePaths);
  // @ts-ignore
  const jsonStore: JSONSchemaStore = new JSONSchemaStore();
  const jsonInput: JSONSchemaInput = new JSONSchemaInput(jsonStore);
  await jsonInput.addSource({ name: '#/definitions/', schema: jsonSchema.schema });
  const inputData: InputData = new InputData();
  inputData.addInput(jsonInput);
  for (let i = 0; i < configs.length; i++) {
    const { lang, ext, rendererOptions } = configs[i];
    const results: MultiFileRenderResult = await quicktypeMultiFile({ inputData, rendererOptions, lang });
    results.forEach((result: SerializedRenderResult, name: string) => {
      if (name.endsWith(ext)) createFile(`./dist/${lang}/${filePathMap[name.replace(extname(name), '')]}.${ext}`, result.lines.join('\n'));
    });
  }
}

function createFile(filePath: string, fileContents: string) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, fileContents);
  console.log(`+ ${filePath}`);
}

load('./src/**/*.ts', [
  { lang: 'java', ext: 'java', rendererOptions: { "just-types": true } },
  { lang: 'schema', ext: 'json', rendererOptions: { "just-types": true } },
  { lang: 'ts', ext: 'ts', rendererOptions: { "just-types": true } }
]);
