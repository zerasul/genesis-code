    /**
     * Configuration key for toolchaintype
     */
 export const TOOLCHAINTYPE = "toolchainType";

 /**
  * Configuration key for custom makefile
  */
  export const MAKEFILE = "custom-makefile";

 /**
  * Configuration key for MARSDEV
  */
  export const MARSDEV_ENV = "MARSDEV";

 /**
  * configuration key for GENDEV
  */
  export const GENDEV_ENV = "GENDEV";

 /**
  * configuration key for GDK
  */
  export const GDK_ENV = "GDK"; 

  /**
 * Use of SGDK or GENDEV toolchains
 */
export const SGDK_GENDEV = "sgdk/gendev";

/**
 * Use of MARSDEV toolchain
 */
export const MARSDEV = "marsdev";

/**
 *  Use of Docker toolchain
 */
export const DOCKER = "docker";

/**
 * Use tag value for a docker
 */
export const DOCKERTAG = "dockerTag";

export const GENS_PATH= "gens.path";

/**
 * DEFAULT MAKEFILE for Windows Systems 
 */
export const DEFAULT_WIN_SGDK_MAKEFILE = "%GDK%\\makefile.gen";

 /**
  * DEFAULT MAKEFILE for GenDev Systems
  */
export const DEFAULT_GENDEV_SGDK_MAKEFILE = "$GENDEV/sgdk/mkfiles/makefile.gen";

/**
 * Windows Constant
 */
export const WIN32="win32";

/**
 * Linux Constant
 */
export const LINUX="linux";

/**
 * MacOs Constant
 */
export const MACOS="darwin";