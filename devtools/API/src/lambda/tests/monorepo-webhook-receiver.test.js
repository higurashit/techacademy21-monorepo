const rewire = require('rewire');

const target_filepath = '../handlers/monorepo-webhook-receiver/';
const target_func = require(target_filepath); // exportしている関数
const target_rewire = rewire(target_filepath); // exportしていない関数

jest.mock('commonLayer');
jest.mock('aws-sdk');

// テストデータパターンの取得
const testdata = require('./testdata.json');

describe('reciever.jsのテスト', () => {
  describe('chooseSetting', () => {
    // 関数読み込み
    const chooseSetting = target_rewire.__get__('chooseSetting');
    // 固定値の設定
    const settings = testdata.settings;

    test.each`
      repositryName      | ref                    | exp_br_name | exp_error
      ${'higu/monorepo'} | ${'refs/heads/main'}   | ${'main'}   | ${undefined}
      ${'higu/monorepo'} | ${'refs/heads/master'} | ${'master'} | ${{ message: 'master branch is not the target.' }}
    `(
      '$repositryName リポジトリの $ref は対象か？',
      ({ repositryName, ref, exp_br_name, exp_error }) => {
        // 各パターンで関数を実行
        const ret = chooseSetting({
          settings,
          repositry: { full_name: repositryName },
          ref,
        });
        expect(ret).toEqual({
          setting:
            exp_error === undefined
              ? { ...settings[0], TargetBranch: exp_br_name }
              : undefined,
          error: exp_error,
        });
      }
    );
  });

  describe('needDeploy', () => {
    // 関数読み込み
    const needDeploy = target_rewire.__get__('needDeploy');
    // 固定値の設定
    const ChangeMatchExpressions = ['services/A/.*', 'services/B/.*'];
    const ignoreFiles = ['*.pdf', '*.md', 'memo.txt'];
    const IgnoreDirectories = ['services/A/docs', 'services/B/docs'];

    test.each`
      filepath                                  | expected
      ${'index.js'}                             | ${false}
      ${'services/A/index.js'}                  | ${true}
      ${'services/B/index.js'}                  | ${true}
      ${'services/C/index.js'}                  | ${false}
      ${'services/AA/index.js'}                 | ${false}
      ${'services/BB/index.js'}                 | ${false}
      ${'services/A/memo.pdf'}                  | ${false}
      ${'services/A/memo.md'}                   | ${false}
      ${'services/A/memo.txt'}                  | ${false}
      ${'services/A/memo.js'}                   | ${true}
      ${'services/B/memo.pdf'}                  | ${false}
      ${'services/B/memo.md'}                   | ${false}
      ${'services/B/memo.txt'}                  | ${false}
      ${'services/B/memo.js'}                   | ${true}
      ${'services/A/docs/img/hoge.png'}         | ${false}
      ${'services/B/docs/img/hoge.png'}         | ${false}
      ${'services/A/docs-release/img/hoge.png'} | ${true}
      ${'services/B/docs-release/img/hoge.png'} | ${true}
      ${'services/A/docs'}                      | ${false}
      ${'services/B/docs'}                      | ${false}
    `(
      '$filepath はパイプライン実行対象か => $expected',
      ({ filepath, expected }) => {
        // 各パターンで関数を実行
        const ret = needDeploy(
          filepath,
          ChangeMatchExpressions,
          ignoreFiles,
          IgnoreDirectories
        );
        expect(ret).toEqual(expected);
      }
    );
  });

  describe('needsExecutePipeline', () => {
    // 関数読み込み
    const needsExecutePipeline = target_rewire.__get__('needsExecutePipeline');
    // 固定値の設定
    const service = {
      ServiceName: 'A Service',
      ChangeMatchExpressions: ['services/A/.*'],
      IgnoreFiles: ['*.pdf', '*.md', 'memo.txt'],
      IgnoreDirectories: ['A/docs'],
    };
    // データパターン読み込み
    const { commitPatterns } = testdata;

    test.each`
      explain                           | commits              | service    | expected
      ${'added, modified, removedあり'} | ${commitPatterns[0]} | ${service} | ${false}
      ${'addedのみ'}                    | ${commitPatterns[1]} | ${service} | ${true}
      ${'modifiedのみ'}                 | ${commitPatterns[2]} | ${service} | ${true}
      ${'removedのみ'}                  | ${commitPatterns[3]} | ${service} | ${true}
      ${'removed, added（削除、追加）'} | ${commitPatterns[4]} | ${service} | ${true}
    `('$explain => $expected', ({ commits, service, expected }) => {
      // 各パターンで関数を実行
      const ret = needsExecutePipeline({ commits, service });
      expect(ret).toEqual(expected);
    });
  });

  // describe('exports.handler', () => {
  //   // 関数読み込み
  //   const handler = target_func;
  //   // 固定値の設定
  //   const service = {
  //     ServiceName: 'A Service',
  //     ChangeMatchExpressions: ['services/A/.*'],
  //     IgnoreFiles: ['*.pdf', '*.md', 'memo.txt'],
  //     IgnoreDirectories: ['A/docs'],
  //   };
  //   // データパターン読み込み
  //   const { commitPatterns } = testdata;

  //   test.each`
  //     explain                           | commits              | service    | expected
  //     ${'added, modified, removedあり'} | ${commitPatterns[0]} | ${service} | ${false}
  //     ${'addedのみ'}                    | ${commitPatterns[1]} | ${service} | ${true}
  //     ${'modifiedのみ'}                 | ${commitPatterns[2]} | ${service} | ${true}
  //     ${'removedのみ'}                  | ${commitPatterns[3]} | ${service} | ${true}
  //     ${'removed, added（削除、追加）'} | ${commitPatterns[4]} | ${service} | ${true}
  //   `('$explain => $expected', ({ commits, service, expected }) => {
  //     // 各パターンで関数を実行
  //     const ret = handler(events);
  //     expect(ret).toEqual(expected);
  //   });
  // });
});
