import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const rootDir = path.resolve(__dirname, '../');

const config: webpack.Configuration = {
    mode: 'none',
    target: 'node',
    entry: './server/index.ts',
    output: {
        path: path.resolve(rootDir, 'dist/build'),
        clean: true,
        filename: 'server.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externalsPresets: {node: true},
    externals: [nodeExternals()],
};

export default config;
