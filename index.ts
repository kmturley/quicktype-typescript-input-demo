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
  const filePathMap: any = createFilePathMap(filePaths);
  const inputData: InputData = await createJSONSchema(filePaths);
  console.log(`📁 ${filePaths}`);
  console.log(filePathMap);
  for (let i = 0; i < configs.length; i++) {
    const { lang, ext, rendererOptions } = configs[i];
    const packagePath: string = typeof rendererOptions.package === 'string' ? rendererOptions.package.replace('.', '/') + '/' : '';
    const results: MultiFileRenderResult = await quicktypeMultiFile({ inputData, rendererOptions, lang });
    results.forEach((result: SerializedRenderResult, name: string) => {
      const fileKey: string = name.replace(extname(name), '');
      const filePath: string = filePathMap[fileKey] || fileKey;
      createFile(`./dist/${lang}/${packagePath}${filePath}.${ext}`, result.lines.join('\n'));
    });
  }
}

function createFilePathMap(filePaths: string[]) {
  const filePathMap: any = {};
  filePaths.forEach((filePath) => {
    const fileExt: string = extname(filePath);
    const fileKey: string = basename(filePath, fileExt);
    filePathMap[fileKey] = filePath.replace('src/', '').replace(fileExt, '');
  });
  return filePathMap;
}

async function createJSONSchema(filePaths: string[]) {
  const jsonSchema: JSONSchemaSourceData = schemaForTypeScriptSources(filePaths);
  // @ts-ignore
  const jsonStore: JSONSchemaStore = new JSONSchemaStore();
  const jsonInput: JSONSchemaInput = new JSONSchemaInput(jsonStore);
  await jsonInput.addSource({ name: '#/definitions/', schema: jsonSchema.schema });
  const inputData: InputData = new InputData();
  inputData.addInput(jsonInput);
  return inputData;
}

function createFile(filePath: string, fileContents: string) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, fileContents);
  console.log(`+ ${filePath}`);
}

load('./src/**/*.ts', [
  { lang: 'java', ext: 'java', rendererOptions: { "just-types": true, package: 'com.example' } },
  { lang: 'schema', ext: 'json', rendererOptions: { "just-types": true } },
  { lang: 'ts', ext: 'ts', rendererOptions: { "just-types": true } }
]);
