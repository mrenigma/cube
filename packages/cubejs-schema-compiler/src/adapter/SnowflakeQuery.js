import { BaseQuery } from './BaseQuery';

const GRANULARITY_TO_INTERVAL = {
  day: 'DAY',
  week: 'WEEK',
  hour: 'HOUR',
  minute: 'MINUTE',
  second: 'SECOND',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR'
};

export class SnowflakeQuery extends BaseQuery {
  convertTz(field) {
    return `CONVERT_TIMEZONE('${this.timezone}', ${field}::timestamp_tz)::timestamp_ntz`;
  }

  timeGroupedColumn(granularity, dimension) {
    return `date_trunc('${GRANULARITY_TO_INTERVAL[granularity]}', ${dimension})`;
  }

  timeStampCast(value) {
    return `${value}::timestamp_tz`;
  }

  defaultRefreshKeyRenewalThreshold() {
    return 120;
  }

  defaultEveryRefreshKey() {
    return {
      every: '2 minutes'
    };
  }

  nowTimestampSql() {
    return 'CURRENT_TIMESTAMP';
  }

  hllInit(sql) {
    return `HLL_EXPORT(HLL_ACCUMULATE(${sql}))`;
  }

  hllMerge(sql) {
    return `HLL_ESTIMATE(HLL_COMBINE(HLL_IMPORT(${sql})))`;
  }

  countDistinctApprox(sql) {
    return `APPROX_COUNT_DISTINCT(${sql})`;
  }

  sqlTemplates() {
    const templates = super.sqlTemplates();
    templates.functions.DATETRUNC = 'DATE_TRUNC({{ args_concat }})';
    templates.functions.DATEPART = 'DATE_PART({{ args_concat }})';
    templates.functions.LOG = 'LOG({% if args[1] is undefined %}10, {% endif %}{{ args_concat }})';
    templates.functions.DLOG10 = 'LOG(10, {{ args_concat }})';
    templates.expressions.extract = 'EXTRACT({{ date_part }} FROM {{ expr }})';
    templates.expressions.interval = 'INTERVAL \'{{ interval }}\'';
    return templates;
  }
}
