import fs from "fs";
import path from "path";
import { baseDirectory } from "../utils/constants.js";
import { ErrorResponse } from "../utils/errorResponse.js";

function checkForChildDirectory(dir, parent) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((i) => i.isDirectory())
    .map((i) => ({
      name: i.name,
      path: path.resolve(baseDirectory, `${parent}/${i.name}`),
    }));
}

function checkForChild(children, parent) {
  children?.map((i) => {
    if (checkForChildDirectory(path.resolve(baseDirectory, i.path)).length) {
      i.child = checkForChildDirectory(
        path.resolve(baseDirectory, i.path),
        i.path
      );
    }
    checkForChild(i.child);
  });
  return children;
}

export async function listDirectories(rootPath) {
  try {
    let allDir = [];
    readAllDirectory(rootPath).map((i) => {
      allDir.push(i);
      if (checkForChildDirectory(path.resolve(baseDirectory, i.path)).length) {
        i.child = checkForChildDirectory(
          path.resolve(baseDirectory, i.path),
          i.name
        );
        checkForChild(i.child);
      }
    });
    return allDir;
  } catch (error) {
    console.log(error.message);
  }
}

export function readAllDirectory(source) {
  try {
    return fs
      .readdirSync(source, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => ({
        name: dir.name,
        path: path.resolve(baseDirectory, dir.name),
      }));
  } catch (error) {
    throw error;
  }
}

export function createDirectory(dir) {
  try {
    if (checkDirectoryExists(dir))
      throw new ErrorResponse("Directory name exist, try a new one", 401);
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    throw error;
  }
}

// returns true if the directory exist
export function checkDirectoryExists(dir) {
  try {
    if (fs.existsSync(dir)) return true;
    return false;
  } catch (error) {
    throw error;
  }
}
